import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../../api/users';
import { functionApi } from '../../api/functions';
import { ArrowLeft, Save, FileCode, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './AssignFunctions.css';

// ✅ Component Tree Node với validation
function FunctionTreeNode({
    node,
    selectedIds,
    onToggle,
    roleFunctionIds,  // ✅ THÊM: IDs from roles
    level = 0
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedIds.includes(node.id);
    const isFromRole = roleFunctionIds.includes(node.id); // ✅ Check if from role

    return (
        <div className="tree-node">
            <div
                className={`tree-node-content ${isSelected ? 'selected' : ''} ${isFromRole ? 'from-role' : ''}`}
                style={{ paddingLeft: `${level * 24 + 16}px` }}
            >
                <button
                    type="button"
                    className="tree-toggle"
                    onClick={() => setIsExpanded(!isExpanded)}
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )
                    ) : (
                        <span className="tree-spacer"></span>
                    )}
                </button>

                <div className="tree-checkbox">
                    <input
                        type="checkbox"
                        checked={isSelected || isFromRole} // ✅ Auto check if from role
                        onChange={() => !isFromRole && onToggle(node.id, node.parent_id)} // ✅ Disable if from role
                        disabled={isFromRole} // ✅ Disable checkbox
                    />
                </div>

                <div className="tree-info">
                    <span className="tree-id">{node.id}</span>
                    <span className="tree-name">{node.name}</span>
                    {hasChildren && (
                        <span className="tree-count">({node.children.length})</span>
                    )}
                    {/* ✅ THÊM: Badge hiển thị "Từ vai trò" */}
                    {isFromRole && (
                        <span className="from-role-badge">
                            <AlertCircle size={12} />
                            Từ vai trò
                        </span>
                    )}
                </div>

                <div className="tree-permissions">
                    {node.show_search && <span className="perm-badge">Tìm</span>}
                    {node.show_add && <span className="perm-badge">Thêm</span>}
                    {node.show_update && <span className="perm-badge">Sửa</span>}
                    {node.show_delete && <span className="perm-badge">Xóa</span>}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="tree-children">
                    {node.children.map((child) => (
                        <FunctionTreeNode
                            key={child.id}
                            node={child}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            roleFunctionIds={roleFunctionIds} // ✅ Pass down
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AssignFunctions() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [selectedFunctions, setSelectedFunctions] = useState([]);
    const [functionMap, setFunctionMap] = useState({});
    const [roleFunctionIds, setRoleFunctionIds] = useState([]); // ✅ THÊM: IDs from roles

    // Get user info
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getById(parseInt(userId)),
    });

    // Get all functions (tree)
    const { data: allFunctions = [], isLoading: functionsLoading } = useQuery({
        queryKey: ['functions'],
        queryFn: functionApi.getAll,
    });

    // Get current user functions (direct only)
    const { data: currentFunctions = [] } = useQuery({
        queryKey: ['user-functions', userId],
        queryFn: () => userApi.getUserFunctions(parseInt(userId)),
        enabled: !!userId,
    });

    // ✅ THÊM: Get user roles with functions
    const { data: userRoles = [] } = useQuery({
        queryKey: ['user-roles', userId],
        queryFn: () => userApi.getRoles(parseInt(userId)),
        enabled: !!userId,
    });

    // ✅ THÊM: Extract function IDs from roles
    useEffect(() => {
        if (userRoles.length > 0) {
            const ids = new Set();

            const extractIds = (nodes) => {
                nodes.forEach((node) => {
                    ids.add(node.id);
                    if (node.children && node.children.length > 0) {
                        extractIds(node.children);
                    }
                });
            };

            userRoles.forEach((role) => {
                if (role.functions && role.functions.length > 0) {
                    extractIds(role.functions);
                }
            });

            setRoleFunctionIds(Array.from(ids));
        }
    }, [userRoles]);

    // Build function map for quick lookup
    useEffect(() => {
        const buildMap = (nodes, map = {}) => {
            nodes.forEach((node) => {
                map[node.id] = {
                    id: node.id,
                    parent_id: node.parent_id,
                    name: node.name,
                };
                if (node.children && node.children.length > 0) {
                    buildMap(node.children, map);
                }
            });
            return map;
        };

        if (allFunctions.length > 0) {
            const map = buildMap(allFunctions);
            setFunctionMap(map);
        }
    }, [allFunctions]);

    // Flatten tree to get all IDs
    const flattenTree = (nodes, result = []) => {
        nodes.forEach((node) => {
            result.push(node.id);
            if (node.children && node.children.length > 0) {
                flattenTree(node.children, result);
            }
        });
        return result;
    };

    // Set initial selected functions
    useEffect(() => {
        if (currentFunctions.length > 0) {
            const ids = flattenTree(currentFunctions);
            setSelectedFunctions(ids);
        }
    }, [currentFunctions]);

    // Get all parent IDs of a function
    const getAllParentIds = (functionId) => {
        const parents = [];
        let currentId = functionId;

        while (currentId && functionMap[currentId]) {
            const func = functionMap[currentId];
            if (func.parent_id) {
                parents.push(func.parent_id);
                currentId = func.parent_id;
            } else {
                break;
            }
        }

        return parents;
    };

    // Get all children IDs of a function (recursive)
    const getAllChildrenIds = (functionId, allFuncs) => {
        const children = [];

        const findChildren = (nodes) => {
            nodes.forEach((node) => {
                if (node.parent_id === functionId) {
                    children.push(node.id);
                    if (node.children && node.children.length > 0) {
                        node.children.forEach(child => {
                            children.push(child.id);
                            findChildren([child]);
                        });
                    }
                } else if (node.children && node.children.length > 0) {
                    findChildren(node.children);
                }
            });
        };

        findChildren(allFuncs);
        return children;
    };

    // Update functions mutation
    const updateMutation = useMutation({
        mutationFn: (functionIds) =>
            userApi.updateFunctions(parseInt(userId), functionIds),
        onSuccess: () => {
            toast.success('Cập nhật chức năng thành công');
            navigate('/users');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Cập nhật chức năng thất bại');
        },
    });

    // Handle toggle with auto-select parent
    const handleToggleFunction = (functionId, parentId) => {
        setSelectedFunctions((prev) => {
            const isCurrentlySelected = prev.includes(functionId);

            if (isCurrentlySelected) {
                // UNCHECK: Remove function + all its children
                const childrenIds = getAllChildrenIds(functionId, allFunctions);
                return prev.filter(
                    (id) => id !== functionId && !childrenIds.includes(id)
                );
            } else {
                // CHECK: Add function + all its parents
                const parentIds = getAllParentIds(functionId);
                const newIds = [functionId, ...parentIds];

                // Remove duplicates
                const uniqueIds = [...new Set([...prev, ...newIds])];
                return uniqueIds;
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedFunctions.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 chức năng');
            return;
        }

        // ✅ Frontend validation: Check for duplicates with role functions
        const duplicates = selectedFunctions.filter(id => roleFunctionIds.includes(id));
        if (duplicates.length > 0) {
            toast.error(`Các chức năng sau đã có trong vai trò: ${duplicates.join(', ')}`);
            return;
        }

        updateMutation.mutate(selectedFunctions);
    };

    // Count total functions
    const totalFunctions = Object.keys(functionMap).length;

    if (userLoading || functionsLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="assign-functions">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/users')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <div>
                    <h2>Phân quyền Chức năng riêng</h2>
                    <p>
                        Người dùng: <strong>{user?.username}</strong>
                    </p>
                    <p className="help-text">
                        * Đây là quyền bổ sung ngoài các quyền từ vai trò
                    </p>
                    <p className="help-text">
                        * Chọn chức năng con sẽ tự động chọn chức năng cha
                    </p>
                    {/* ✅ THÊM: Warning message */}
                    {roleFunctionIds.length > 0 && (
                        <p className="help-text warning">
                            <AlertCircle size={14} />
                            Các chức năng đã có từ vai trò sẽ bị vô hiệu hóa
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="assign-container">
                    <div className="assign-header">
                        <div className="header-info">
                            <FileCode size={20} />
                            <span>Chọn chức năng cho người dùng</span>
                        </div>
                        <div className="header-counts">
                            <span className="selected-count">
                                Đã chọn: {selectedFunctions.length}/{totalFunctions}
                            </span>
                            {/* ✅ THÊM: Show count from roles */}
                            {roleFunctionIds.length > 0 && (
                                <span className="role-count">
                                    Từ vai trò: {roleFunctionIds.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="functions-tree">
                        {allFunctions.map((node) => (
                            <FunctionTreeNode
                                key={node.id}
                                node={node}
                                selectedIds={selectedFunctions}
                                onToggle={handleToggleFunction}
                                roleFunctionIds={roleFunctionIds} // ✅ Pass role function IDs
                                level={0}
                            />
                        ))}
                    </div>

                    {allFunctions.length === 0 && (
                        <div className="empty-state">
                            <p>Chưa có chức năng nào trong hệ thống</p>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/users')}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateMutation.isLoading}
                    >
                        <Save size={18} />
                        {updateMutation.isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}