import { useQuery } from '@tanstack/react-query';
import { functionApi } from '../../api/functions';
import { ChevronRight, ChevronDown, FileCode } from 'lucide-react';
import { useState } from 'react';
import './FunctionList.css';

// Component hiển thị tree node
function TreeNode({ node, level = 0 }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="tree-node">
            <div className="tree-node-content" style={{ paddingLeft: `${level * 24}px` }}>
                <button
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

                <div className="tree-node-info">
                    <span className="tree-node-id">{node.id}</span>
                    <span className="tree-node-name">{node.name}</span>
                    {hasChildren && (
                        <span className="tree-node-count">
                            ({node.children.length} con)
                        </span>
                    )}
                </div>

                <div className="tree-node-permissions">
                    {node.show_search && <span className="permission-badge">Xem</span>}
                    {node.show_add && <span className="permission-badge">Thêm</span>}
                    {node.show_update && <span className="permission-badge">Sửa</span>}
                    {node.show_delete && <span className="permission-badge">Xóa</span>}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="tree-children">
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FunctionList() {
    const { data: functions = [], isLoading } = useQuery({
        queryKey: ['functions'],
        queryFn: functionApi.getAll,
    });

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="function-list">
            <div className="page-header">
                <div>
                    <h2>Danh sách chức năng</h2>
                    <p>Cây chức năng phân cấp trong hệ thống</p>
                </div>
            </div>

            <div className="function-tree-container">
                <div className="tree-header">
                    <div className="tree-header-col">Chức năng</div>
                    <div className="tree-header-col">Quyền</div>
                </div>

                <div className="tree-body">
                    {functions.map((node) => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            level={0}
                        />
                    ))}
                </div>
            </div>

            {functions.length === 0 && (
                <div className="empty-state">
                    <FileCode size={48} color="#cbd5e1" />
                    <p>Chưa có chức năng nào</p>
                </div>
            )}
        </div>
    );
}