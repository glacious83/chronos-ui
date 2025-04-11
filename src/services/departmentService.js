// src/services/departmentService.js
import axiosInstance from './axiosInstance';

export const getAllDepartments = () => {
    return axiosInstance.get('/departments');
};

export default { getAllDepartments };
