import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/users';
import { ArrowLeft, Shield, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import './UserPermissions.css';

// Component Tree Node - Chỉ hiển thị (không có checkbox)
function FunctionTreeNode({ node, level = 0 }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="perm-tree-node">
            <div
                className="perm-tree-content"
                style={{ paddingLeft: `${level * 24 + 16}px` }}
            >
                <button
                    type="button"
                    className="perm-tree-toggle"
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
                        <span className="perm-tree-spacer"></span>
                    )}
                </button>

                <div className="perm-tree-info">
                    <span className="perm-tree-id">{node.id}</span>
                    <span className="perm-tree-name">{node.name}</span>
                    {hasChildren && (
                        <span className="perm-tree-count">({node.children.length})</span>
                    )}
                </div>

                <div className="perm-tree-badges">
                    {node.show_search && <span className="perm-badge">xem</span>}
                    {node.show_add && <span className="perm-badge">Thêm</span>}
                    {node.show_update && <span className="perm-badge">Sửa</span>}
                    {node.show_delete && <span className="perm-badge">Xóa</span>}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="perm-tree-children">
                    {node.children.map((child) => (
                        <FunctionTreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function UserPermissions() {
    const { userId } = useParams();
    const navigate = useNavigate();

    // Get user info
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getById(parseInt(userId)),
    });

    // Get user roles (with functions)
    const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ['user-roles', userId],
        queryFn: () => userApi.getRoles(parseInt(userId)),
        enabled: !!userId,
    });

    // Get user direct functions
    const { data: userFunctions = [], isLoading: functionsLoading } = useQuery({
        queryKey: ['user-functions', userId],
        queryFn: () => userApi.getUserFunctions(parseInt(userId)),
        enabled: !!userId,
    });

    // Get ALL functions (roles + user)
    const { data: allFunctions = [], isLoading: allFunctionsLoading } = useQuery({
        queryKey: ['user-all-functions', userId],
        queryFn: () => userApi.getAllFunctions(parseInt(userId)),
        enabled: !!userId,
    });

    // Count functions in tree
    const countFunctions = (nodes) => {
        if (!nodes || nodes.length === 0) return 0;
        let count = nodes.length;
        nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
                count += countFunctions(node.children);
            }
        });
        return count;
    };

    const isLoading = userLoading || rolesLoading || functionsLoading || allFunctionsLoading;

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="user-permissions">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/users')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <div>
                    <h2>Quyền của Người dùng</h2>
                    <p>
                        Người dùng: <strong>{user?.username}</strong>
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="perm-stats">
                <div className="perm-stat-card">
                    <div className="perm-stat-icon" style={{ backgroundColor: '#dbeafe' }}>
                        <Shield size={24} color="#2563eb" />
                    </div>
                    <div className="perm-stat-content">
                        <p className="perm-stat-label">Vai trò</p>
                        <h3 className="perm-stat-value">{userRoles.length}</h3>
                    </div>
                </div>

                <div className="perm-stat-card">
                    <div className="perm-stat-icon" style={{ backgroundColor: '#d1fae5' }}>
                        <FileCode size={24} color="#10b981" />
                    </div>
                    <div className="perm-stat-content">
                        <p className="perm-stat-label">Chức năng riêng</p>
                        <h3 className="perm-stat-value">{countFunctions(userFunctions)}</h3>
                    </div>
                </div>

                <div className="perm-stat-card">
                    <div className="perm-stat-icon" style={{ backgroundColor: '#fef3c7' }}>
                        <FileCode size={24} color="#f59e0b" />
                    </div>
                    <div className="perm-stat-content">
                        <p className="perm-stat-label">Tổng chức năng</p>
                        <h3 className="perm-stat-value">{countFunctions(allFunctions)}</h3>
                    </div>
                </div>
            </div>

            {/* Roles Section */}
            <div className="perm-section">
                <div className="perm-section-header">
                    <div className="perm-section-title">
                        <Shield size={20} />
                        <h3>Vai trò ({userRoles.length})</h3>
                    </div>
                </div>

                <div className="perm-section-content">
                    {userRoles.length > 0 ? (
                        <div className="roles-grid">
                            {userRoles.map((role) => (
                                <div key={role.id} className="role-detail-card">
                                    <div className="role-detail-header">
                                        <h4>{role.name}</h4>
                                        <span className="role-detail-count">
                                            {countFunctions(role.functions)} chức năng
                                        </span>
                                    </div>

                                    {role.functions && role.functions.length > 0 && (
                                        <div className="role-detail-functions">
                                            {role.functions.map((func) => (
                                                <FunctionTreeNode key={func.id} node={func} level={0} />
                                            ))}
                                        </div>
                                    )}

                                    {(!role.functions || role.functions.length === 0) && (
                                        <p className="role-detail-empty">Vai trò chưa có chức năng</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="perm-empty">
                            <p>Người dùng chưa có vai trò nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Direct Functions Section */}
            <div className="perm-section">
                <div className="perm-section-header">
                    <div className="perm-section-title">
                        <FileCode size={20} />
                        <h3>Chức năng riêng ({countFunctions(userFunctions)})</h3>
                    </div>
                    <p className="perm-section-note">
                        Đây là các chức năng được gán trực tiếp, ngoài vai trò
                    </p>
                </div>

                <div className="perm-section-content">
                    {userFunctions.length > 0 ? (
                        <div className="functions-container">
                            {userFunctions.map((func) => (
                                <FunctionTreeNode key={func.id} node={func} level={0} />
                            ))}
                        </div>
                    ) : (
                        <div className="perm-empty">
                            <p>Người dùng chưa có chức năng riêng nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* All Functions Section */}
            <div className="perm-section">
                <div className="perm-section-header">
                    <div className="perm-section-title">
                        <FileCode size={20} />
                        <h3>Tổng hợp tất cả quyền ({countFunctions(allFunctions)})</h3>
                    </div>
                    <p className="perm-section-note">
                        Bao gồm tất cả chức năng từ vai trò + chức năng riêng (đã gộp, không trùng)
                    </p>
                </div>

                <div className="perm-section-content">
                    {allFunctions.length > 0 ? (
                        <div className="functions-container">
                            {allFunctions.map((func) => (
                                <FunctionTreeNode key={func.id} node={func} level={0} />
                            ))}
                        </div>
                    ) : (
                        <div className="perm-empty">
                            <p>Người dùng chưa có quyền nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}