import axiosInstance from './axios';

export const userApi = {
    // ✅ Lấy tất cả users
    getAll: async () => {
        const response = await axiosInstance.get('/user');
        return response.data;
    },

    // ✅ Lấy user theo ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/user/${id}`);
        return response.data;
    },

    // ✅ Lấy user theo username
    getByUsername: async (username) => {
        const response = await axiosInstance.get(`/user/by-username/${username}`);
        return response.data;
    },

    // ✅ Tạo user
    create: async (data) => {
        const response = await axiosInstance.post('/user', data);
        return response.data;
    },

    // ✅ Cập nhật user
    update: async (id, data) => {
        const response = await axiosInstance.put(`/user/${id}`, data);
        return response.data;
    },

    // ✅ Xóa user
    delete: async (id) => {
        const response = await axiosInstance.delete(`/user/${id}`);
        return response.data;
    },

    // ✅ Lấy TẤT CẢ functions của user (từ roles + user)
    getAllFunctions: async (userId) => {
        const response = await axiosInstance.get(`/userfunction/AllFunctions/${userId}`);
        return response.data;
    },

    // ✅ Lấy functions gán TRỰC TIẾP cho user
    getUserFunctions: async (userId) => {
        const response = await axiosInstance.get(`/userfunction/UserFunctions/${userId}`);
        return response.data;
    },

    // ✅ Cập nhật functions cho user
    updateFunctions: async (userId, functionIds) => {
        const response = await axiosInstance.put(`/userfunction/${userId}`, functionIds);
        return response.data;
    },

    // ✅ Xóa functions của user
    deleteFunctions: async (userId) => {
        const response = await axiosInstance.delete(`/userfunction/${userId}`);
        return response.data;
    },

    // ✅ Lấy roles của user
    getRoles: async (userId) => {
        const response = await axiosInstance.get(`/userrole/${userId}`);
        return response.data;
    },

    // ✅ Cập nhật roles cho user
    updateRoles: async (userId, roleIds) => {
        const response = await axiosInstance.put(`/userrole/${userId}`, roleIds);
        return response.data;
    },

    // ✅ Xóa roles của user
    deleteRoles: async (userId) => {
        const response = await axiosInstance.delete(`/userrole/${userId}`);
        return response.data;
    },
};