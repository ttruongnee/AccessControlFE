import axios from 'axios';

const API_BASE_URL = 'https://localhost:7202/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - Thêm access token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle refresh token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ✅ Chỉ retry 1 lần
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('🔄 Access token hết hạn, đang refresh...');

                // ✅ Call refresh token API
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                console.log('✅ Refresh token response:', response.data);

                // ✅ QUAN TRỌNG: Lấy accessToken từ response
                const newAccessToken = response.data.accessToken;

                if (!newAccessToken) {
                    throw new Error('Access token không có trong response');
                }

                // ✅ Lưu access token mới
                localStorage.setItem('accessToken', newAccessToken);
                console.log('✅ Đã lưu access token mới');

                // ✅ Update header của request gốc
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // ✅ Retry request gốc
                console.log('🔄 Retry request gốc với token mới...');
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error('❌ Refresh token thất bại:', refreshError);

                // ✅ Clear localStorage
                localStorage.removeItem('accessToken');

                // ✅ Redirect to login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;