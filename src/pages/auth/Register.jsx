import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import './Register.css';

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await authApi.register({
                username: data.username,
                password: data.password,
            });

            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Đăng ký tài khoản</h2>
                    <p>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Nhập username"
                            className={errors.username ? 'input-error' : ''}
                            {...register('username', {
                                required: 'Username là bắt buộc',
                                minLength: {
                                    value: 3,
                                    message: 'Username phải có ít nhất 3 ký tự',
                                },
                            })}
                        />
                        {errors.username && (
                            <span className="error-message">{errors.username.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Nhập password"
                            className={errors.password ? 'input-error' : ''}
                            {...register('password', {
                                required: 'Password là bắt buộc',
                                minLength: {
                                    value: 6,
                                    message: 'Password phải có ít nhất 6 ký tự',
                                },
                            })}
                        />
                        {errors.password && (
                            <span className="error-message">{errors.password.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Nhập lại password"
                            className={errors.confirmPassword ? 'input-error' : ''}
                            {...register('confirmPassword', {
                                required: 'Vui lòng xác nhận password',
                                validate: (value) => value === password || 'Password không khớp',
                            })}
                        />
                        {errors.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>
            </div>
        </div>
    );
}