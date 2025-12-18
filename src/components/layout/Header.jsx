import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = async () => {
        try {
            // ✅ Gọi API logout (xóa cookie ở backend)
            await authApi.logout();

            // ✅ Clear local storage và store
            clearAuth();

            toast.success('Đăng xuất thành công');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Vẫn logout ở frontend dù API lỗi
            clearAuth();
            navigate('/login');
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1>Quản lý phân quyền</h1>
                </div>

                <div className="header-right">
                    <div className="user-info">
                        <User size={20} />
                        <span>{user?.username || 'Admin'}</span>
                    </div>

                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </header>
    );
}