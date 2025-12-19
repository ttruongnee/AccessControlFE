import axiosInstance from './axios';

export const functionApi = {
    // ✅ Lấy tất cả functions (tree structure)
    getAll: async () => {
        const response = await axiosInstance.get('/function');
        return response.data;
    },

    // ✅ Lấy function theo ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/function/${id}`);
        return response.data;
    }
};