// src/services/userService.js
import axios from 'axios';

const API_BASE = '';

export const getUserById = (id) => {
    return axios.get(`${API_BASE}/api/users/${id}`);
};

export const updateUser = (id, data) => {
    return axios.put(`${API_BASE}/api/users/${id}`, data);
};

export const deleteUser = (id) => {
    return axios.delete(`${API_BASE}/api/users/${id}`);
};

export const getAllUsers = () => {
    return axios.get(`${API_BASE}/api/users`);
};

export default { getUserById, updateUser, deleteUser, getAllUsers };
