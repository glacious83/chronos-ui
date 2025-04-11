import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import LoginForm from '../components/LoginForm';

function LoginPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (employeeId, password) => {
        try {
            const response = await authService.login(employeeId, password);
            const token = response.data.access_token;
            if (token) {
                localStorage.setItem('authToken', token);
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