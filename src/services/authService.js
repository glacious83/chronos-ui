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
    });
};

const register = (userData) => {
    return axios.post('/api/users/register', userData);
};

export default { login, register };
