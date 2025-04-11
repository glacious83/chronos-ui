// src/pages/Register.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService'; // adjust the path as needed

function Register() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        password: '',
        title: '',
        departmentId: '' // New field for department selection.
    });
    const [error, setError] = useState('');
    const [titles, setTitles] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Fetch allowed titles from the /titles endpoint with Bearer token.
    useEffect(() => {
        const fetchTitles = async () => {
            try {
                // Retrieve the token using our helper function.
                const token = authService.getToken();
                const response = await axios.get('api/rates/titles', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Expect an array of strings.
                setTitles(response.data);
            } catch (err) {
                console.error('Error fetching titles:', err);
                setError('Failed to fetch titles.');
            }
        };
        fetchTitles();
    }, []);

    // Fetch departments from /api/departments.
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('/api/departments');
                // Expect an array of objects with at least "id" and "code" properties.
                setDepartments(response.data);
            } catch (err) {
                console.error('Error fetching departments:', err);
                setError('Failed to fetch departments.');
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // You can either use authService.register or the axios.post call.
            await axios.post('/api/users/register', user);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label>First Name:</label><br />
                    <input
                        type="text"
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Last Name:</label><br />
                    <input
                        type="text"
                        name="lastName"
                        value={user.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Employee ID:</label><br />
                    <input
                        type="text"
                        name="employeeId"
                        value={user.employeeId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Title:</label><br />
                    <select
                        name="title"
                        value={user.title}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Title --</option>
                        {titles.map((title, idx) => (
                            <option key={idx} value={title}>{title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Department:</label><br />
                    <select
                        name="departmentId"
                        value={user.departmentId}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.code}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" style={{ marginTop: '1rem' }}>Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;
