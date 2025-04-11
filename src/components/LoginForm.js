import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import '../styles/Login.css';
import {Link} from "react-router-dom";

function LoginForm({ onLogin, error }) {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(employeeId, password);
    };

    return (
        <Box className="form-container">
            <Typography variant="h4" align="center" gutterBottom>Login</Typography>
            {error && <Typography className="error">{error}</Typography>}
            <form onSubmit={handleSubmit}>
                <TextField label="Employee ID" fullWidth margin="normal" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
                <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </Box>
    );
}

export default LoginForm;