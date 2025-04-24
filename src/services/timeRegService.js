import axiosInstance from './axiosInstance';

const BASE_URL = '/api/time-entries';

const TimeRegService = {
    getAll: async () => {
        const response = await axiosInstance.get(BASE_URL);
        return response.data;
    },

    getByDate(userId, date) {
        return axiosInstance
            .get(BASE_URL + `/${userId}/time-entries`, { params: { date } })
            .then(resp => resp.data);
    },

    getByRange: async (userId, startDate, endDate) => {
        const { data } = await axiosInstance.get(
            BASE_URL + `/${userId}/time-entries`,
            { params: { startDate, endDate } }
        );
        return data;
    },

    create: async (entry) => {
        const response = await axiosInstance.post(BASE_URL, entry);
        return response.data;
    },

    update: async (id, entry) => {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, entry);
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
        return response.data;
    }
};

export default TimeRegService;
