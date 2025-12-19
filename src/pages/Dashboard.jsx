import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/users';
import { roleApi } from '../api/roles';
import { functionApi } from '../api/functions';
import { Users, Shield, FileCode } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAll,
    });

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.getAll,
    });

    const { data: functions = [] } = useQuery({
        queryKey: ['functions'],
        queryFn: functionApi.getAll,
    });

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


    // ✅ SỬA: Đếm tổng functions từ tree
    const totalFunctions = countLeafFunctions(functions);

    const stats = [
        {
            title: 'Người dùng',
            value: users.length,
            icon: Users,
            color: '#2563eb',
            bgColor: '#dbeafe',
        },
        {
            title: 'Vai trò',
            value: roles.length,
            icon: Shield,
            color: '#10b981',
            bgColor: '#d1fae5',
        },
        {
            title: 'Chức năng',
            value: totalFunctions, // ✅ SỬA: Dùng totalFunctions thay vì functions.length
            icon: FileCode,
            color: '#f59e0b',
            bgColor: '#fef3c7',
        },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <p>Tổng quan hệ thống phân quyền</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div
                            className="stat-icon"
                            style={{
                                backgroundColor: stat.bgColor,
                                color: stat.color,
                            }}
                        >
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Người dùng mới</h3>
                    <div className="card-content">
                        {users
                            .sort((a, b) => b.id - a.id)
                            .slice(0, 5)
                            .map((user) => (
                                <div key={user.id} className="user-item">
                                    <div className="user-avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    {/* ✅ SỬA: Flex container cho username và roles */}
                                    <div className="user-info-container">
                                        <p className="user-name">{user.username}</p>
                                        {/* ✅ THÊM: Hiển thị role badges */}
                                        <div className="user-role-badges">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <span key={role.id} className="user-role-badge">
                                                        {role.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="user-role-badge no-role">
                                                    Chưa có vai trò
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Vai trò mới</h3>
                    <div className="card-content">
                        {/* ✅ Sắp xếp theo ID giảm dần */}
                        {roles
                            .sort((a, b) => b.id - a.id)
                            .slice(0, 5)
                            .map((role) => (
                                <div key={role.id} className="role-item">
                                    <Shield size={20} color="#10b981" />
                                    <div className="role-details">
                                        <p className="role-name">{role.name}</p>
                                        <p className="role-functions">
                                            {countLeafFunctions(role.functions)} chức năng
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}