// src/services/leaveService.js
import axiosInstance from './axiosInstance';

const BASE_URL = '/api/leaves';

const LeaveService = {
    /**
     * Create a new leave entry.
     * body: { userId, date, leaveType }
     */
    create: async ({ userId, date, leaveType }) => {
        const { data } = await axiosInstance.post(BASE_URL, {
            userId,
            date,
            leaveType
        });
        return data;
    },

    /**
     * Fetch all leave entries for a user between startDate and endDate.
     * GET /api/leaves/{userId}/fetch?startDate=...&endDate=...
     */
    getWeekly: async (userId, startDate, endDate) => {
        const { data } = await axiosInstance.get(
            BASE_URL + `/${userId}/fetch`,
            { params: { startDate, endDate } }
        );
        return data;
    },

    getSubordinates: (managerId) =>
        axiosInstance.get(BASE_URL + `/subordinates/3`)
            .then(r => r.data),

    updateSubordinateStatus: (managerId, leaveId, newStatus) =>
        axiosInstance.put(
            BASE_URL + `/subordinates/${managerId}/${leaveId}`,
            null,
            { params: { newStatus } }
        ).then(r => r.data),

    /**
     * Cancel (delete) a leave entry.
     * PUT /api/leaves/{leaveId}/cancel?userId=...
     */
    cancel: async (leaveId, userId) => {
        const { data } = await axiosInstance.put(
            BASE_URL + `/${leaveId}/cancel`,
            null,
            { params: { userId } }
        );
        return data;
    }
};

export default LeaveService;
