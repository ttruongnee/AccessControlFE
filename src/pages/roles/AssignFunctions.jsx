import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '../../api/roles';
import { functionApi } from '../../api/functions';
import { ArrowLeft, Save, FileCode, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AssignFunctions.css';

// Component Tree Node với checkbox
function FunctionTreeNode({ node, selectedIds, onToggle, level = 0 }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedIds.includes(node.id);

    return (
        <div className="tree-node">
            <div
                className={`tree-node-content ${isSelected ? 'selected' : ''}`}
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
                        checked={isSelected}
                        onChange={() => onToggle(node.id)}
                    />
                </div>

                <div className="tree-info">
                    <span className="tree-id">{node.id}</span>
                    <span className="tree-name">{node.name}</span>
                    {hasChildren && (
                        <span className="tree-count">({node.children.length})</span>
                    )}
                </div>

                <div className="tree-permissions">
                    {node.show_search && <span className="perm-badge">Xem</span>}
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
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AssignFunctions() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedFunctions, setSelectedFunctions] = useState([]);
    const [functionMap, setFunctionMap] = useState({});
    const [childrenMap, setChildrenMap] = useState({}); // ✅ THÊM

    // Get role info
    const { data: role, isLoading: roleLoading } = useQuery({
        queryKey: ['role', roleId],
        queryFn: () => roleApi.getById(parseInt(roleId)),
    });

    // Get all functions (tree)
    const { data: allFunctions = [], isLoading: functionsLoading } = useQuery({
        queryKey: ['functions'],
        queryFn: functionApi.getAll,
    });

    // Get current role functions
    const { data: currentFunctions = [] } = useQuery({
        queryKey: ['role-functions', roleId],
        queryFn: () => roleApi.getFunctions(parseInt(roleId)),
        enabled: !!roleId,
    });

    // ✅ Build function map AND children map
    useEffect(() => {
        const buildMap = (nodes, map = {}) => {
            nodes.forEach((node) => {
                map[node.id] = {
                    id: node.id,
                    parent_id: node.parent_id,
                    name: node.name,
                    children: node.children || []
                };
                if (node.children && node.children.length > 0) {
                    buildMap(node.children, map);
                }
            });
            return map;
        };

        // ✅ Build children map: parentId -> [childId1, childId2, ...]
        const buildChildrenMap = (nodes, map = {}) => {
            nodes.forEach((node) => {
                if (node.children && node.children.length > 0) {
                    map[node.id] = node.children.map(child => child.id);
                    buildChildrenMap(node.children, map);
                }
            });
            return map;
        };

        if (allFunctions.length > 0) {
            const map = buildMap(allFunctions);
            const childMap = buildChildrenMap(allFunctions);
            setFunctionMap(map);
            setChildrenMap(childMap);
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

    // ✅ Get all parent IDs of a function
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

    // ✅ Get ALL children IDs recursively
    const getAllChildrenIds = (functionId) => {
        const children = [];

        const collectChildren = (id) => {
            if (childrenMap[id]) {
                childrenMap[id].forEach(childId => {
                    children.push(childId);
                    collectChildren(childId); // Recursive
                });
            }
        };

        collectChildren(functionId);
        return children;
    };

    // Update functions mutation
    const updateMutation = useMutation({
        mutationFn: (functionIds) =>
            roleApi.updateFunctions(parseInt(roleId), functionIds),
        onSuccess: () => {
            queryClient.invalidateQueries(['role-functions', roleId]);
            toast.success('Cập nhật chức năng thành công');
            navigate('/roles');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Cập nhật chức năng thất bại');
        },
    });

    // Delete all functions mutation
    const deleteAllMutation = useMutation({
        mutationFn: () => roleApi.deleteFunctions(parseInt(roleId)),
        onSuccess: () => {
            queryClient.invalidateQueries(['role-functions', roleId]);
            setSelectedFunctions([]);
            toast.success('Xóa toàn bộ chức năng của vai trò thành công');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Xóa chức năng thất bại');
        },
    });

    // ✅ NEW: Handle toggle with new logic
    const handleToggleFunction = (functionId) => {
        setSelectedFunctions((prev) => {
            const isCurrentlySelected = prev.includes(functionId);
            const func = functionMap[functionId];

            if (isCurrentlySelected) {
                // ❌ UNCHECK
                const childrenIds = getAllChildrenIds(functionId);
                let newSelected = prev.filter(
                    (id) => id !== functionId && !childrenIds.includes(id)
                );

                // ✅ Check nếu bỏ chọn hết tất cả con → Bỏ chọn cha
                if (func.parent_id) {
                    const parent = functionMap[func.parent_id];
                    if (parent && childrenMap[func.parent_id]) {
                        const allSiblings = childrenMap[func.parent_id];
                        const hasAnySelectedSibling = allSiblings.some(siblingId =>
                            newSelected.includes(siblingId)
                        );

                        // Nếu không còn con nào được chọn → Bỏ chọn cha
                        if (!hasAnySelectedSibling) {
                            newSelected = newSelected.filter(id => id !== func.parent_id);

                            // Đệ quy lên trên (nếu cha cũng có cha)
                            let currentParentId = parent.parent_id;
                            while (currentParentId && functionMap[currentParentId]) {
                                const currentParent = functionMap[currentParentId];
                                if (childrenMap[currentParentId]) {
                                    const siblings = childrenMap[currentParentId];
                                    const hasSelected = siblings.some(id => newSelected.includes(id));
                                    if (!hasSelected) {
                                        newSelected = newSelected.filter(id => id !== currentParentId);
                                        currentParentId = currentParent.parent_id;
                                    } else {
                                        break;
                                    }
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }

                return newSelected;

            } else {
                // ✅ CHECK
                let newSelected = [...prev];

                // 1. Thêm function đang chọn
                newSelected.push(functionId);

                // 2. Tự động chọn TẤT CẢ parents
                const parentIds = getAllParentIds(functionId);
                parentIds.forEach(parentId => {
                    if (!newSelected.includes(parentId)) {
                        newSelected.push(parentId);
                    }
                });

                // 3. Tự động chọn TẤT CẢ children (nếu có)
                const childrenIds = getAllChildrenIds(functionId);
                childrenIds.forEach(childId => {
                    if (!newSelected.includes(childId)) {
                        newSelected.push(childId);
                    }
                });

                return [...new Set(newSelected)]; // Remove duplicates
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedFunctions.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 chức năng');
            return;
        }

        updateMutation.mutate(selectedFunctions);
    };

    // Handle delete all with confirmation
    const handleDeleteAll = () => {
        if (selectedFunctions.length === 0) {
            toast.error('Vai trò chưa có chức năng nào');
            return;
        }

        if (window.confirm(
            `Bạn có chắc muốn xóa TOÀN BỘ chức năng của vai trò "${role?.name}"?`
        )) {
            deleteAllMutation.mutate();
        }
    };

    const totalFunctions = Object.keys(functionMap).length;

    if (roleLoading || functionsLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="assign-functions">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/roles')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <div>
                    <h2>Phân quyền Chức năng cho Vai trò</h2>
                    <p>
                        Vai trò: <strong>{role?.name}</strong>
                    </p>
                    <p className="help-text">
                        * Chọn chức năng cha sẽ tự động chọn TẤT CẢ con
                    </p>
                    <p className="help-text">
                        * Bỏ chọn hết con sẽ tự động bỏ chọn cha
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="assign-container">
                    <div className="assign-header">
                        <div className="header-info">
                            <FileCode size={20} />
                            <span>Chọn chức năng cho vai trò</span>
                        </div>
                        <div className="header-actions">
                            <span className="selected-count">
                                Đã chọn: {selectedFunctions.length}/{totalFunctions}
                            </span>
                            <button
                                type="button"
                                className="btn-delete-all"
                                onClick={handleDeleteAll}
                                disabled={deleteAllMutation.isLoading || selectedFunctions.length === 0}
                                title="Xóa toàn bộ chức năng của vai trò"
                            >
                                <Trash2 size={16} />
                                Xóa toàn bộ
                            </button>
                        </div>
                    </div>

                    <div className="functions-tree">
                        {allFunctions.map((node) => (
                            <FunctionTreeNode
                                key={node.id}
                                node={node}
                                selectedIds={selectedFunctions}
                                onToggle={handleToggleFunction}
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
                        onClick={() => navigate('/roles')}
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