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
    },

    // ✅ Tạo function
    create: async (data) => {
        const response = await axiosInstance.post('/function', data);
        return response.data;
    },

    // ✅ Cập nhật function
    update: async (id, data) => {
        const response = await axiosInstance.put(`/function/${id}`, data);
        return response.data;
    },

    // ✅ Xóa function
    delete: async (id) => {
        const response = await axiosInstance.delete(`/function/${id}`);
        return response.data;
    },
};