import axiosInstance from './axiosInstance';

const HolidaysService = {
    getAll: async (year) => {
        const { data } = await axiosInstance.get('/api/holidays', {
            params: { year }
        });
        return data;
    }
};

export default HolidaysService;
