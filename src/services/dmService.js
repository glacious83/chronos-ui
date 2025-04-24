// src/services/dmService.js
import axiosInstance from './axiosInstance';

const BASE_URL = '/api/dms';

const DMService = {
    getAll: async () => {
        const response = await axiosInstance.get(BASE_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosInstance.get(`${BASE_URL}/${id}`);
        return response.data;
    }
};

export default DMService;
