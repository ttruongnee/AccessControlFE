import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../../api/users';
import { roleApi } from '../../api/roles';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import './AssignRoles.css';

export default function AssignRoles() {
    const { userId } = useParams();
    const navigate = useNavigate();
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
            toast.success('Cập nhật vai trò thành công');
            navigate('/users');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Cập nhật vai trò thất bại');
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
                        <span className="selected-count">
                            Đã chọn: {selectedRoles.length}/{allRoles.length}
                        </span>
                    </div>

                    <div className="roles-list">
                        {allRoles.map((role) => (
                            <div
                                key={role.id}
                                className={`role-item ${selectedRoles.includes(role.id) ? 'selected' : ''
                                    }`}
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