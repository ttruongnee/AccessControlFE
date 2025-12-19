import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/users';
import { roleApi } from '../../api/roles';
import { ArrowLeft, Save, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AssignRoles.css';

export default function AssignRoles() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedRoles, setSelectedRoles] = useState([]);

    // Get user info
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getById(parseInt(userId)),
    });

    // Get all roles
    const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.getAll,
    });

    // Get current user roles
    const { data: currentRoles = [] } = useQuery({
        queryKey: ['user-roles', userId],
        queryFn: () => userApi.getRoles(parseInt(userId)),
        enabled: !!userId,
    });

    // Set initial selected roles
    useEffect(() => {
        if (currentRoles.length > 0) {
            setSelectedRoles(currentRoles.map((role) => role.id));
        }
    }, [currentRoles]);

    // Update roles mutation
    const updateMutation = useMutation({
        mutationFn: (roleIds) => userApi.updateRoles(parseInt(userId), roleIds),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-roles', userId]);
            toast.success('Cập nhật vai trò thành công');
            navigate('/users');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Cập nhật vai trò thất bại');
        },
    });

    // Delete all roles mutation
    const deleteAllMutation = useMutation({
        mutationFn: () => userApi.deleteRoles(parseInt(userId)),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-roles', userId]);
            setSelectedRoles([]);
            toast.success('Xóa toàn bộ vai trò thành công');
            // navigate('/users');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Xóa vai trò thất bại');
        },
    });

    const handleToggleRole = (roleId) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(selectedRoles);
    };

    // Handle delete all with confirmation
    const handleDeleteAll = () => {
        if (selectedRoles.length === 0) {
            toast.error('Người dùng chưa có vai trò nào');
            return;
        }

        if (window.confirm(
            `Bạn có chắc muốn xóa TOÀN BỘ vai trò của người dùng "${user?.username}"?`
        )) {
            deleteAllMutation.mutate();
        }
    };

    if (userLoading || rolesLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="assign-roles">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/users')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <div>
                    <h2>Phân quyền Vai trò</h2>
                    <p>
                        Người dùng: <strong>{user?.username}</strong>
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="assign-container">
                    <div className="assign-header">
                        <div className="header-info">
                            <Shield size={20} />
                            <span>Chọn vai trò cho người dùng</span>
                        </div>
                        <div className="header-actions">
                            <span className="selected-count">
                                Đã chọn: {selectedRoles.length}/{allRoles.length}
                            </span>
                            <button
                                type="button"
                                className="btn-delete-all"
                                onClick={handleDeleteAll}
                                disabled={deleteAllMutation.isLoading || selectedRoles.length === 0}
                                title="Xóa toàn bộ vai trò"
                            >
                                <Trash2 size={16} />
                                Xóa toàn bộ
                            </button>
                        </div>
                    </div>

                    <div className="roles-list">
                        {allRoles.map((role) => (
                            <div
                                key={role.id}
                                className={`role-item ${selectedRoles.includes(role.id) ? 'selected' : ''}`}
                                onClick={() => handleToggleRole(role.id)}
                            >
                                <div className="role-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role.id)}
                                        onChange={() => { }}
                                    />
                                </div>
                                <div className="role-info">
                                    <div className="role-name">{role.name}</div>
                                    <div className="role-meta">
                                        ID: {role.id} • {role.functions?.length || 0} chức năng
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {allRoles.length === 0 && (
                        <div className="empty-state">
                            <p>Chưa có vai trò nào trong hệ thống</p>
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