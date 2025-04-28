import React, {useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import LoginForm from '../components/LoginForm';
import {UserContext} from "../context/UserContext";
import axiosInstance from "../services/axiosInstance";

function LoginPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { setUserName, setRoles } = useContext(UserContext);

    const handleLogin = async (employeeId, password) => {
        try {
            const response = await authService.login(employeeId, password);
            const token = response.data.access_token;
            const userId = response.data.userId; // Pass this from BE on login response

            if (token) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('userId', userId); // Store userId
                const { data } = await axiosInstance.get(`/api/users/${userId}`);
                setUserName(data.firstName);
                setRoles(data.roles.map(r => r.name));
                navigate('/home');
            } else {
                setError('No token received');
            }
        } catch (err) {
            setError(err.response?.data || 'Login failed');
        }
    };

    return <LoginForm onLogin={handleLogin} error={error} />;
}

export default LoginPage;