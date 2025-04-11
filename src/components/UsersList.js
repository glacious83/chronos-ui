// src/components/UsersList.js
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, MenuItem, Tooltip } from '@mui/material';
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Middle Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>SAP ID</TableCell>
                            <TableCell>VM</TableCell>
                            <TableCell>IP</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell>Approved</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.firstName}</TableCell>
                                <TableCell>{user.middleName}</TableCell>
                                <TableCell>{user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.employeeId}</TableCell>
                                <TableCell>{user.sapId}</TableCell>
                                <TableCell>{user.vm}</TableCell>
                                <TableCell>{user.ip}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.location}</TableCell>
                                <TableCell>{user.title}</TableCell>
                                <TableCell>{user.department}</TableCell>
                                <TableCell>{user.responsibleManager}</TableCell>
                                <TableCell>{user.company}</TableCell>
                                <TableCell>{user.active ? <CheckIcon /> : <CloseIcon />}</TableCell>
                                <TableCell>{user.approved ? <CheckIcon /> : <CloseIcon />}</TableCell>
                                <TableCell>
                                    {!user.approved && <Tooltip title="Approve"><IconButton sx={{ backgroundColor: 'transparent!important', color: 'inherit' }} onClick={() => handleApproveClick(user.id)}><DoneAllIcon /></IconButton></Tooltip>}
                                    {!user.active && <Tooltip title="Activate"><IconButton sx={{ backgroundColor: 'transparent!important', color: 'inherit' }} onClick={() => handleActivateClick(user.id, true)}><LockOpenIcon /></IconButton></Tooltip>}
                                    <IconButton sx={{ backgroundColor: 'transparent!important', color: 'inherit' }} onClick={() => handleEditClick(user)}><EditIcon /></IconButton>
                                    <IconButton sx={{ backgroundColor: 'transparent!important', color: 'inherit' }} onClick={() => handleDeleteClick(user.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default UsersList;