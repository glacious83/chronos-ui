import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegisterForm from '../components/RegisterForm';
import '../styles/Login.css';

function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [titles, setTitles] = useState([]);

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                const response = await axios.get('api/rates/titles');
                setTitles(response.data);
            } catch (err) {
                setError('Failed to fetch titles');
            }
        };
        fetchTitles();
    }, []);

    const handleRegister = async (user) => {
        try {
            await axios.post('/api/users/register', user);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return <RegisterForm onRegister={handleRegister} error={error} titles={titles} />;
}

export default RegisterPage;