import axiosInstance from './axiosInstance';

const HolidaysService = {
    getAll: async () => {
        const { data } = await axiosInstance.get('/api/holidays');
        return data;
    }
};

export default HolidaysService;
