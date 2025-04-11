// src/services/authService.js
import axios from 'axios';

const login = (employeeId, password) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', employeeId);
    params.append('password', password);

    return axios.post('/oauth/token', params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: [(data) => data]
    }).then(response => {
        // Assume token is returned in response.data.access_token.
        const token = response.data.access_token;
        // Store the token in local storage.
        localStorage.setItem('access_token', token);
        return response;
    });
};

const register = (userData) => {
    // If your registration endpoint is protected, you can include the token here.
    // Otherwise, you could leave it as a plain post.
    return axios.post('/api/users/register', userData);
};

// Helper function to expose the token
const getToken = () => localStorage.getItem('access_token');

export default { login, register, getToken };
