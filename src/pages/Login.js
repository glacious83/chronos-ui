import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function Login() {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Call the OAuth2 token endpoint using the password grant.
            const response = await authService.login(employeeId, password);
            // Expecting a JSON like {access_token: "xxx", token_type:"bearer", expires_in: 3600}
            const token = response.data.access_token;
            if (token) {
                // Store token (for production, consider secure storage and token refresh logic)
                localStorage.setItem('authToken', token);
                navigate('/home');
            } else {
                setError('No token received');
            }
        } catch (err) {
            setError(err.response?.data || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Employee ID:</label><br />
                    <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;
