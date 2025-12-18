import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Shield,
    FileCode
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'Người dùng' },
        { path: '/roles', icon: Shield, label: 'Vai trò' },
        { path: '/functions', icon: FileCode, label: 'Chức năng' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Access Control</h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}