import axios from 'axios';

const API_BASE_URL = 'https://localhost:7202/api';

export const authApi = {
    // ✅ Đăng ký
    register: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
        return response.data;
    },

    // ✅ Đăng nhập
    login: async (data) => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            data,
            { withCredentials: true } // ✅ Nhận cookie
        );
        return response.data;
    },

    // ✅ Refresh token (từ cookie)
    refreshToken: async () => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true } // ✅ Gửi cookie
        );
        return response.data;
    },

    // ✅ Logout
    logout: async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/auth/logout`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
        }
    },
};