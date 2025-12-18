import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/users';
import { Plus, Trash2, Edit, Shield, FileCode, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import './UserList.css';

export default function UserList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: userApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Tạo người dùng thành công');
            setIsCreateModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Tạo người dùng thất bại');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => userApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Cập nhật người dùng thành công');
            setIsEditModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Cập nhật người dùng thất bại');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: userApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Xóa người dùng thành công');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Xóa người dùng thất bại');
        },
    });

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
        });
        setSelectedUser(null);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Password không khớp');
            return;
        }
        createMutation.mutate({
            username: formData.username,
            password: formData.password,
        });
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: '',
            confirmPassword: '',
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error('Password không khớp');
            return;
        }
        updateMutation.mutate({
            id: selectedUser.id,
            data: {
                username: formData.username,
                password: formData.password,
            },
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            deleteMutation.mutate(id);
        }
    };

    // Filter users
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="user-list">
            <div className="page-header">
                <div>
                    <h2>Quản lý người dùng</h2>
                    <p>Danh sách tất cả người dùng trong hệ thống</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={18} />
                    Thêm người dùng
                </button>
            </div>

            {/* Search */}
            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-small">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.username}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="badges">
                                        {user.roles?.map((role) => (
                                            <span key={role.id} className="badge badge-primary">
                                                {role.name}
                                            </span>
                                        ))}
                                        {user.roles?.length === 0 && (
                                            <span className="badge badge-secondary">
                                                Chưa có vai trò
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon btn-icon-info"
                                            title="Xem quyền"
                                            onClick={() =>
                                                (window.location.href = `/users/${user.id}/permissions`)
                                            }
                                        >
                                            <FileCode size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-primary"
                                            title="Phân quyền Roles"
                                            onClick={() =>
                                                (window.location.href = `/users/${user.id}/assign-roles`)
                                            }
                                        >
                                            <Shield size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-success"
                                            title="Phân quyền Functions"
                                            onClick={() =>
                                                (window.location.href = `/users/${user.id}/assign-functions`)
                                            }
                                        >
                                            <FileCode size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-warning"
                                            title="Sửa"
                                            onClick={() => handleEdit(user)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-danger"
                                            title="Xóa"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <p>Không tìm thấy người dùng nào</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                title="Thêm người dùng mới"
            >
                <form onSubmit={handleCreate} className="user-form">
                    <div className="form-group">
                        <label>Username *</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            required
                            placeholder="Nhập username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                            placeholder="Nhập password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Xác nhận Password *</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            required
                            placeholder="Nhập lại password"
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
                title="Cập nhật người dùng"
            >
                <form onSubmit={handleUpdate} className="user-form">
                    <div className="form-group">
                        <label>Username *</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            required
                            placeholder="Nhập username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password mới (để trống nếu không đổi)</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            placeholder="Nhập password mới"
                        />
                    </div>

                    <div className="form-group">
                        <label>Xác nhận Password mới</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            placeholder="Nhập lại password mới"
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