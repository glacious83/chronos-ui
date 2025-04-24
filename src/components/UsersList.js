// src/components/UsersList.js
import React, { useState, useEffect } from 'react';
import '../styles/UsersList.css';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Tooltip,
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import axiosInstance from '../services/axiosInstance';

function UsersList({ users }) {
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [menuUserId, setMenuUserId] = useState(null);

    const handleMenuOpen = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setMenuUserId(userId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuUserId(null);
    };

    useEffect(() => {
        const fetchOptions = async () => {
            const token = localStorage.getItem('authToken');

            const departmentsResponse = await axiosInstance.get('/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const companiesResponse = await axiosInstance.get('/api/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDepartments(departmentsResponse.data);
            setCompanies(companiesResponse.data);
        };

        fetchOptions();
    }, []);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOpenEdit(true);
    };

    const handleDeleteClick = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const token = localStorage.getItem('authToken');
            await axiosInstance.delete(`/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload();
        }
    };

    const handleApproveClick = async (userId) => {
        const token = localStorage.getItem('authToken');
        await axiosInstance.put(`/api/admin/users/${userId}/approve?approved=true`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        window.location.reload();
    };

    const handleActivateClick = async (userId, active) => {
        const token = localStorage.getItem('authToken');
        await axiosInstance.put(`/api/admin/users/${userId}/activate?active=${active}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        window.location.reload();
    };

    if (!Array.isArray(users) || users.length === 0) {
        return <Typography variant="h6" sx={{ m: 2 }}>No users found.</Typography>;
    }

    return (
        <>
            <Box sx={{ paddingRight: '16px', overflowX: 'auto' }}>
                <TableContainer component={Paper}>
                    <Table size="small" sx={{ minWidth: '700px' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell className="compact-cell">First Name</TableCell>
                            <TableCell className="compact-cell">Middle Name</TableCell>
                            <TableCell className="compact-cell">Last Name</TableCell>
                            <TableCell className="compact-cell">Email</TableCell>
                            <TableCell className="compact-cell">Sydipel</TableCell>
                            <TableCell className="compact-cell">SAP ID</TableCell>
                            <TableCell className="compact-cell">VM</TableCell>
                            <TableCell className="compact-cell">IP</TableCell>
                            <TableCell className="compact-cell">Phone</TableCell>
                            <TableCell className="compact-cell">Location</TableCell>
                            <TableCell className="compact-cell">Title</TableCell>
                            <TableCell className="compact-cell">Department</TableCell>
                            <TableCell className="compact-cell">Manager</TableCell>
                            <TableCell className="compact-cell">Company</TableCell>
                            <TableCell className="compact-cell">Active</TableCell>
                            <TableCell className="compact-cell">Approved</TableCell>
                            <TableCell className="compact-cell">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="compact-cell">{user.firstName}</TableCell>
                                <TableCell className="compact-cell">{user.middleName}</TableCell>
                                <TableCell className="compact-cell">{user.lastName}</TableCell>
                                <TableCell className="compact-cell">{user.email}</TableCell>
                                <TableCell className="compact-cell">{user.employeeId}</TableCell>
                                <TableCell className="compact-cell">{user.sapId}</TableCell>
                                <TableCell className="compact-cell">{user.vm}</TableCell>
                                <TableCell className="compact-cell">{user.ip}</TableCell>
                                <TableCell className="compact-cell">{user.phone}</TableCell>
                                <TableCell className="compact-cell">{user.location?.cityName || '-'}</TableCell>
                                <TableCell className="compact-cell">{user.title}</TableCell>
                                <TableCell className="compact-cell">{user.department?.code || '-'}</TableCell>
                                <TableCell className="compact-cell">{user.responsibleManager ? `${user.responsibleManager.firstName} ${user.responsibleManager.lastName}` : '-'}</TableCell>
                                <TableCell className="compact-cell">{user.company?.name || '-'}</TableCell>
                                <TableCell className="compact-cell">{user.active ? <CheckIcon /> : <CloseIcon />}</TableCell>
                                <TableCell className="compact-cell">{user.approved ? <CheckIcon /> : <CloseIcon />}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={(event) => handleMenuOpen(event, user.id)}
                                        sx={{ backgroundColor: 'transparent', color: 'inherit' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={menuUserId === user.id && Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        sx={{ '& .MuiPaper-root': { backgroundColor: 'transparent', boxShadow: 'none' } }}
                                    >
                                        {/* Conditionally render actions based on user properties */}
                                        {!user.approved && (
                                            <MenuItem onClick={() => { handleApproveClick(user.id); handleMenuClose(); }}>
                                                <Tooltip title="Approve">
                                                    <DoneAllIcon fontSize="small" />
                                                </Tooltip>
                                                Approve
                                            </MenuItem>
                                        )}
                                        {!user.active && (
                                            <MenuItem onClick={() => { handleActivateClick(user.id, true); handleMenuClose(); }}>
                                                <Tooltip title="Activate">
                                                    <LockOpenIcon fontSize="small" />
                                                </Tooltip>
                                                Activate
                                            </MenuItem>
                                        )}
                                        <MenuItem onClick={() => { handleEditClick(user); handleMenuClose(); }}>
                                            <Tooltip title="Edit">
                                                <EditIcon fontSize="small" />
                                            </Tooltip>
                                            Edit
                                        </MenuItem>
                                        <MenuItem onClick={() => { handleDeleteClick(user.id); handleMenuClose(); }}>
                                            <Tooltip title="Delete">
                                                <DeleteIcon fontSize="small" />
                                            </Tooltip>
                                            Delete
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Box>
        </>
    );
}

export default UsersList;