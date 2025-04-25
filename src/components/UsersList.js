// src/components/UsersList.js
import React, { useState, useEffect } from 'react';
import '../styles/UsersList.css';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Box, Button, Menu
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DoneAll as DoneAllIcon,
    LockOpen as LockOpenIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axiosInstance';

export default function UsersList({ users, setUsers }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuUserId, setMenuUserId] = useState(null);

    const [openEdit, setOpenEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [titles, setTitles] = useState([]);
    const [managers, setManagers] = useState([]);

    // Roles that qualify as “manager” in your system
    const managerRoles = ['Διευθυντής', 'Υπόδιευθυντής', 'Automation Test Architect'];

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        // fetch depts, companies, titles and all users (filter for managers)
        Promise.all([
            axiosInstance.get('/api/departments',    { headers: { Authorization: `Bearer ${token}` } }),
            axiosInstance.get('/api/companies',      { headers: { Authorization: `Bearer ${token}` } }),
            axiosInstance.get('/api/rates/titles',   { headers: { Authorization: `Bearer ${token}` } }),
            axiosInstance.get('/api/users',          { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([deptRes, compRes, titlesRes, usersRes]) => {
            setDepartments(deptRes.data);
            setCompanies(compRes.data);
            setTitles(titlesRes.data);

            // Filter and sort managers by last name
            const mgrs = usersRes.data
                .filter(u => managerRoles.includes(u.title))
                .sort((a, b) => a.lastName.localeCompare(b.lastName));
            setManagers(mgrs);
        }).catch(console.error);
    }, []);

    const handleMenuOpen = (e, id) => {
        setAnchorEl(e.currentTarget);
        setMenuUserId(id);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuUserId(null);
    };

    const handleApprove = async (userId) => {
        const token = localStorage.getItem('authToken');
        await axiosInstance.put(
            `/api/admin/users/${userId}/approve?approved=true`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(u => u.map(x => x.id === userId ? { ...x, approved: true } : x));
    };

    const handleActivate = async (userId) => {
        const token = localStorage.getItem('authToken');
        await axiosInstance.put(
            `/api/admin/users/${userId}/activate?active=true`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(u => u.map(x => x.id === userId ? { ...x, active: true } : x));
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        const token = localStorage.getItem('authToken');
        await axiosInstance.delete(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(u => u.filter(x => x.id !== userId));
    };

    const handleEditOpen = (user) => {
        setSelectedUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName || '',
            email: user.email,
            employeeId: user.employeeId,
            password: '',
            title: user.title,
            departmentId: user.department?.id || '',
            responsibleManagerId: user.responsibleManager?.id || '',
            companyId: user.company?.id || ''
        });
        setOpenEdit(true);
        handleMenuClose();
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const body = {
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            middleName: selectedUser.middleName,
            email: selectedUser.email,
            employeeId: selectedUser.employeeId,
            password: selectedUser.password,
            title: selectedUser.title,
            departmentId: +selectedUser.departmentId,
            responsibleManagerId: selectedUser.responsibleManagerId
                ? +selectedUser.responsibleManagerId
                : null
        };

        await axiosInstance.put(
            `/api/users/${selectedUser.id}`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update that user in the list
        setUsers(u =>
            u.map(x =>
                x.id === selectedUser.id
                    ? {
                        ...x,
                        firstName: body.firstName,
                        lastName: body.lastName,
                        middleName: body.middleName,
                        email: body.email,
                        employeeId: body.employeeId,
                        title: body.title,
                        department: departments.find(d => d.id === body.departmentId),
                        responsibleManager: body.responsibleManagerId
                            ? managers.find(m => m.id === body.responsibleManagerId)
                            : null,
                        company: companies.find(c => c.id === selectedUser.companyId)
                    }
                    : x
            )
        );

        setOpenEdit(false);
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {[
                                'First Name','Middle','Last','Email',
                                'Sydipel','SAP ID','VM','IP','Phone',
                                'Location','Title','Dept','Manager',
                                'Company','Active','Approved','Actions'
                            ].map(label => (
                                <TableCell key={label}>{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => (
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
                                <TableCell>{user.location?.cityName}</TableCell>
                                <TableCell>{user.title}</TableCell>
                                <TableCell>{user.department?.code}</TableCell>
                                <TableCell>
                                    {user.responsibleManager
                                        ? `${user.responsibleManager.firstName} ${user.responsibleManager.lastName}`
                                        : '— none —'}
                                </TableCell>
                                <TableCell>{user.company?.name}</TableCell>
                                <TableCell>{user.active ? <CheckIcon/> : <CloseIcon/>}</TableCell>
                                <TableCell>{user.approved ? <CheckIcon/> : <CloseIcon/>}</TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={e => handleMenuOpen(e, user.id)}>
                                        <MoreVertIcon/>
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={menuUserId === user.id}
                                        onClose={handleMenuClose}
                                    >
                                        {!user.approved &&
                                            <MenuItem onClick={() => handleApprove(user.id)}>
                                                <DoneAllIcon fontSize="small"/> Approve
                                            </MenuItem>
                                        }
                                        {!user.active &&
                                            <MenuItem onClick={() => handleActivate(user.id)}>
                                                <LockOpenIcon fontSize="small"/> Activate
                                            </MenuItem>
                                        }
                                        <MenuItem onClick={() => handleEditOpen(user)}>
                                            <EditIcon fontSize="small"/> Edit
                                        </MenuItem>
                                        <MenuItem onClick={() => handleDelete(user.id)}>
                                            <DeleteIcon fontSize="small"/> Delete
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {openEdit && (
                <Dialog open onClose={() => setOpenEdit(false)}>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="normal" fullWidth label="First Name"
                            value={selectedUser.firstName}
                            onChange={e => setSelectedUser(s => ({ ...s, firstName: e.target.value }))}
                        />
                        <TextField
                            margin="normal" fullWidth label="Last Name"
                            value={selectedUser.lastName}
                            onChange={e => setSelectedUser(s => ({ ...s, lastName: e.target.value }))}
                        />
                        <TextField
                            margin="normal" fullWidth label="Middle Name"
                            value={selectedUser.middleName}
                            onChange={e => setSelectedUser(s => ({ ...s, middleName: e.target.value }))}
                        />
                        <TextField
                            margin="normal" fullWidth label="Email"
                            value={selectedUser.email}
                            onChange={e => setSelectedUser(s => ({ ...s, email: e.target.value }))}
                        />
                        <TextField
                            margin="normal" fullWidth label="Employee ID"
                            value={selectedUser.employeeId}
                            onChange={e => setSelectedUser(s => ({ ...s, employeeId: e.target.value }))}
                        />
                        <TextField
                            margin="normal" fullWidth label="Password" type="password"
                            value={selectedUser.password}
                            onChange={e => setSelectedUser(s => ({ ...s, password: e.target.value }))}
                        />

                        <TextField
                            select margin="normal" fullWidth label="Title"
                            value={selectedUser.title}
                            onChange={e => setSelectedUser(s => ({ ...s, title: e.target.value }))}
                        >
                            {titles.map(t => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select margin="normal" fullWidth label="Department"
                            value={selectedUser.departmentId}
                            onChange={e => setSelectedUser(s => ({ ...s, departmentId: e.target.value }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.code}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select margin="normal" fullWidth label="Manager"
                            value={selectedUser.responsibleManagerId}
                            onChange={e => setSelectedUser(s => ({ ...s, responsibleManagerId: e.target.value }))}
                        >
                            <MenuItem value="">— none —</MenuItem>
                            {managers.map(m => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.lastName}, {m.firstName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select margin="normal" fullWidth label="Company"
                            value={selectedUser.companyId}
                            onChange={e => setSelectedUser(s => ({ ...s, companyId: e.target.value }))}
                        >
                            {companies.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}
