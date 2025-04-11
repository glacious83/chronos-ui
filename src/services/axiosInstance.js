// src/services/axiosInstance.js
import axios from 'axios';

// Create an instance
const axiosInstance = axios.create({
    baseURL: '', // if you have a proxy setup in package.json, leave this blank or set your backend URL
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
            // If token is present, attach the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
