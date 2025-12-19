import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '../../api/roles';
import { Plus, Trash2, Edit, FileCode, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import './RoleList.css';

export default function RoleList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
    });

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: roleApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            toast.success('Tạo vai trò thành công');
            setIsCreateModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Tạo vai trò thất bại');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => roleApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            toast.success('Cập nhật vai trò thành công');
            setIsEditModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Cập nhật vai trò thất bại');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: roleApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            toast.success('Xóa vai trò thành công');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Xóa vai trò thất bại');
        },
    });

    const resetForm = () => {
        setFormData({ name: '' });
        setSelectedRole(null);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate({ name: formData.name });
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setFormData({ name: role.name });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        updateMutation.mutate({
            id: selectedRole.id,
            data: { name: formData.name },
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa vai trò này?')) {
            deleteMutation.mutate(id);
        }
    };

    // Count leaf functions (chỉ đếm chức năng lá)
    const countLeafFunctions = (functions) => {
        if (!functions || functions.length === 0) return 0;

        let count = 0;

        functions.forEach((func) => {
            if (!func.children || func.children.length === 0) {
                // là chức năng lá
                count += 1;
            } else {
                // có con → duyệt tiếp
                count += countLeafFunctions(func.children);
            }
        });

        return count;
    };


    // Filter roles
    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="role-list">
            <div className="page-header">
                <div>
                    <h2>Quản lý vai trò</h2>
                    <p>Danh sách tất cả vai trò trong hệ thống</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={18} />
                    Thêm vai trò
                </button>
            </div>

            {/* Search */}
            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên vai trò..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="roles-grid">
                {filteredRoles.map((role) => (
                    <div key={role.id} className="role-card">
                        <div className="role-card-header">
                            <div className="role-icon">
                                <FileCode size={24} />
                            </div>
                            <h3>{role.name}</h3>
                        </div>

                        <div className="role-card-body">
                            <div className="role-stat">
                                <span className="role-stat-label">Chức năng:</span>
                                <span className="role-stat-value">
                                    {countLeafFunctions(role.functions)} chức năng
                                </span>
                            </div>

                            {/* {role.functions && role.functions.length > 0 && (
                                <div className="role-functions">
                                    <p className="role-functions-title">Chức năng chính:</p>
                                    <div className="function-badges">
                                        {role.functions.slice(0, 3).map((func) => (
                                            <span key={func.id} className="function-badge">
                                                {func.name}
                                            </span>
                                        ))}
                                        {role.functions.length > 3 && (
                                            <span className="function-badge function-badge-more">
                                                +{role.functions.length - 3} khác
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )} */}
                        </div>

                        <div className="role-card-footer">
                            <button
                                className="btn-text btn-text-primary"
                                onClick={() =>
                                    (window.location.href = `/roles/${role.id}/assign-functions`)
                                }
                            >
                                <FileCode size={16} />
                                Phân quyền
                            </button>
                            <button
                                className="btn-text btn-text-warning"
                                onClick={() => handleEdit(role)}
                            >
                                <Edit size={16} />
                                Sửa
                            </button>
                            <button
                                className="btn-text btn-text-danger"
                                onClick={() => handleDelete(role.id)}
                            >
                                <Trash2 size={16} />
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRoles.length === 0 && (
                <div className="empty-state">
                    <FileCode size={48} color="#cbd5e1" />
                    <p>Không tìm thấy vai trò nào</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                title="Thêm vai trò mới"
            >
                <form onSubmit={handleCreate} className="role-form">
                    <div className="form-group">
                        <label>Tên vai trò *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ name: e.target.value })}
                            required
                            placeholder="Nhập tên vai trò"
                        />
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                resetForm();
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createMutation.isLoading}
                        >
                            {createMutation.isLoading ? 'Đang tạo...' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                }}
                title="Cập nhật vai trò"
            >
                <form onSubmit={handleUpdate} className="role-form">
                    <div className="form-group">
                        <label>Tên vai trò *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ name: e.target.value })}
                            required
                            placeholder="Nhập tên vai trò"
                        />
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                resetForm();
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={updateMutation.isLoading}
                        >
                            {updateMutation.isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}