import React, {useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import axiosInstance from '../services/axiosInstance';
import '../styles/NavBar.css';
import {UserContext} from "../context/UserContext";
import { Tabs, Tab } from '@mui/material';
import { useLocation } from 'react-router-dom';


function NavBar() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { userName, setUserName } = useContext(UserContext);
    const location = useLocation();
    const [value, setValue] = useState(location.pathname);

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
        navigate(newValue);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setUserName('');
        navigate('/login');
    };

    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');

            if (token && userId) {
                try {
                    const response = await axiosInstance.get(`/api/users/${userId}`);
                    setUserName(response.data.firstName);
                } catch (error) {
                    console.error('Failed to fetch user name', error);
                }
            }
        };

        fetchUserName();
    }, []);

    return (
        <AppBar position="static">
            <Toolbar className="navbar-toolbar">
                <Typography variant="h4" className="navbar-title">
                    Chronos
                </Typography>

                <Tabs
                    value={value}
                    onChange={handleTabChange}
                    textColor="inherit"
                    indicatorColor="secondary"
                >
                    <Tab label="Admin" value="/admin" />
                    <Tab label="TimeReg" value="/timereg" />
                </Tabs>

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="body1" sx={{ marginRight: 2 }}>
                    {userName ? `Hi, ${userName}` : ''}
                </Typography>

                <IconButton
                    size="large"
                    edge="end"
                    color="inherit"
                    onClick={handleMenu}
                >
                    <AccountCircle />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {!userName && (
                        <MenuItem onClick={() => navigate('/login')}>Login</MenuItem>
                    )}

                    {userName && (
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    )}
                </Menu>

            </Toolbar>
        </AppBar>
    );
}

export default NavBar;
