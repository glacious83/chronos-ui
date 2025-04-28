import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation }         from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Tabs,
    Tab
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import axiosInstance from '../services/axiosInstance';
import '../styles/NavBar.css';
import { UserContext } from "../context/UserContext";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [value, setValue]       = useState(location.pathname);

    // get both name and roles from context
    const { userName, setUserName, roles, setRoles } = useContext(UserContext);

    const handleMenu = e => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleTabChange = (_, newVal) => {
        setValue(newVal);
        navigate(newVal);
    };
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setUserName('');
        setRoles([]);      // clear roles on logout
        navigate('/login');
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token  = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                try {
                    // Fetch your user DTO — make sure it includes a `roles` array
                    const { data } = await axiosInstance.get(`/api/users/${userId}`);
                    setUserName(data.firstName);
                    setRoles(data.roles.map(r => r.name));
                    console.log('User roles:', data.roles);
                } catch (err) {
                    console.error('Failed to fetch user info', err);
                }
            }
        };
        fetchUser();
    }, [setUserName, setRoles, userName]);

    const has = role => {
        const result = roles.includes(role);
        console.log(`Checking role: ${role}, Exists: ${result}`);
        return result;
    };

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
                    {/* Admin tab → ROLE_GLOBAL_ADMIN OR ROLE_DIRECTORY_ADMIN */}
                    {(has('ROLE_GLOBAL_ADMIN') || has('ROLE_DIRECTORY_ADMIN')) && (
                        <Tab label="Admin"   value="/admin" />
                    )}

                    {/* TimeReg tab → ROLE_USER OR ROLE_DIRECTORY_ADMIN */}
                    {(has('ROLE_USER') || has('ROLE_DIRECTORY_ADMIN')) && (
                        <Tab label="TimeReg" value="/timereg" />
                    )}
                </Tabs>

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="body1" sx={{ marginRight: 2 }}>
                    {userName ? `Hi, ${userName}` : ''}
                </Typography>

                <IconButton
                    className="nav-account-btn"
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
                        <MenuItem onClick={() => navigate('/login')}>
                            Login
                        </MenuItem>
                    )}
                    {userName && (
                        <MenuItem onClick={handleLogout}>
                            Logout
                        </MenuItem>
                    )}
                </Menu>

            </Toolbar>
        </AppBar>
    );
}

export default NavBar;
