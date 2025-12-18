import axiosInstance from './axios';

export const roleApi = {
    // ✅ Lấy tất cả roles
    getAll: async () => {
        const response = await axiosInstance.get('/role');
        return response.data;
    },

    // ✅ Lấy role theo ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/role/${id}`);
        return response.data;
    },

    // ✅ Tạo role
    create: async (data) => {
        const response = await axiosInstance.post('/role', data);
        return response.data;
    },

    // ✅ Cập nhật role
    update: async (id, data) => {
        const response = await axiosInstance.put(`/role/${id}`, data);
        return response.data;
    },

    // ✅ Xóa role
    delete: async (id) => {
        const response = await axiosInstance.delete(`/role/${id}`);
        return response.data;
    },

    // ✅ Lấy functions của role
    getFunctions: async (roleId) => {
        const response = await axiosInstance.get(`/rolefunction/${roleId}`);
        return response.data;
    },

    // ✅ Cập nhật functions cho role
    updateFunctions: async (roleId, functionIds) => {
        const response = await axiosInstance.put(`/rolefunction/${roleId}`, functionIds);
        return response.data;
    },

    // ✅ Xóa functions của role
    deleteFunctions: async (roleId) => {
        const response = await axiosInstance.delete(`/rolefunction/${roleId}`);
        return response.data;
    },
};