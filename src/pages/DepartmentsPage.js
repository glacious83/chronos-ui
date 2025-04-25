// src/pages/DepartmentsPage.js
import React, { useEffect, useState } from 'react';
import {
    Paper,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../services/axiosInstance';

export default function DepartmentsPage({ refreshErrors }) {
    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({ id: null, code: '', managerId: '' });

    const managerRoles = ['Διευθυντής', 'Υπόδιευθυντής', 'Automation Test Architect'];

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const token = localStorage.getItem('authToken');
        try {
            const [deptRes, userRes] = await Promise.all([
                axiosInstance.get('/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
                axiosInstance.get('/api/users', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setDepartments(deptRes.data);
            const mgrs = userRes.data.filter(u => managerRoles.includes(u.title));
            setManagers(mgrs);
        } catch (err) {
            console.error('Failed to fetch departments or users', err);
        }
    }

    const handleOpen = (dept = { id: null, code: '', manager: null }) => {
        setForm({
            id: dept.id,
            code: dept.code,
            managerId: dept.manager?.id || ''
        });
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setForm({ id: null, code: '', managerId: '' });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = { code: form.code, managerId: form.managerId || null };
        try {
            if (form.id) {
                await axiosInstance.put(`/api/departments/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axiosInstance.post('/api/departments', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            handleClose();
            fetchData();
            refreshErrors();
        } catch (err) {
            console.error('Failed to save department', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this department?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(`/api/departments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            refreshErrors();
        } catch (err) {
            console.error('Failed to delete department', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>
                Add Department
            </Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments.map(d => (
                            <TableRow key={d.id}>
                                <TableCell>{d.code}</TableCell>
                                <TableCell>
                                    {d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : '— none —'}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(d)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(d.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Department' : 'New Department'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Code"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                        required
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        select
                        label="Manager"
                        value={form.managerId}
                        onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}
                        required
                    >
                        <MenuItem value="">— none —</MenuItem>
                        {managers.map(m => (
                            <MenuItem key={m.id} value={m.id}>
                                {m.lastName}, {m.firstName}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!form.code || !form.managerId}>Save</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}