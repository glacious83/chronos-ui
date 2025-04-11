import React, { useState } from 'react';
import { TextField, Select, MenuItem, Button, Typography, Box } from '@mui/material';
import '../styles/Register.css';

function RegisterForm({ onRegister, error, titles }) {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        password: '',
        title: ''
    });

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(user);
    };

    return (
        <Box className="form-container">
            <Typography variant="h4" align="center" gutterBottom>Register</Typography>
            {error && <Typography className="error">{error}</Typography>}
            <form onSubmit={handleSubmit}>
                <TextField label="First Name" name="firstName" fullWidth margin="normal" value={user.firstName} onChange={handleChange} required />
                <TextField label="Last Name" name="lastName" fullWidth margin="normal" value={user.lastName} onChange={handleChange} required />
                <TextField label="Email" name="email" type="email" fullWidth margin="normal" value={user.email} onChange={handleChange} required />
                <TextField label="Employee ID" name="employeeId" fullWidth margin="normal" value={user.employeeId} onChange={handleChange} required />
                <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={user.password} onChange={handleChange} required />
                <Select name="title" fullWidth value={user.title} onChange={handleChange} displayEmpty required sx={{ mt: 2 }}>
                    <MenuItem value="">-- Select Title --</MenuItem>
                    {titles.map((title, index) => (
                        <MenuItem key={index} value={title}>{title}</MenuItem>
                    ))}
                </Select>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
            </form>
        </Box>
    );
}

export default RegisterForm;