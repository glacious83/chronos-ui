// src/pages/DMsPage.js
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
    IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../services/axiosInstance';

export default function DMsPage({ refreshErrors }) {
    const [dms, setDms] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({ id: null, code: '', description: '', budget: '', startDate: '', endDate: '' });

    useEffect(() => {
        fetchDMs();
    }, []);

    async function fetchDMs() {
        const token = localStorage.getItem('authToken');
        try {
            const res = await axiosInstance.get('/api/dms', { headers: { Authorization: `Bearer ${token}` } });
            setDms(res.data);
        } catch (err) {
            console.error('Failed to fetch DMs', err);
        }
    }

    const handleOpen = dm => {
        if (dm) {
            setForm({
                id: dm.id,
                code: dm.code || '',
                description: dm.description || '',
                budget: dm.budget != null ? dm.budget : '',
                startDate: dm.startDate || '',
                endDate: dm.endDate || ''
            });
        } else {
            setForm({ id: null, code: '', description: '', budget: '', startDate: '', endDate: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setForm({ id: null, code: '', description: '', budget: '', startDate: '', endDate: '' });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = {
            code: form.code,
            description: form.description,
            budget: parseFloat(form.budget),
            startDate: form.startDate,
            endDate: form.endDate
        };
        try {
            if (form.id) {
                await axiosInstance.put(`/api/dms/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axiosInstance.post('/api/dms', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            handleClose();
            fetchDMs();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to save DM', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this DM?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(`/api/dms/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchDMs();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to delete DM', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>Add DM</Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Budget</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dms.map(dm => (
                            <TableRow key={dm.id}>
                                <TableCell>{dm.code}</TableCell>
                                <TableCell>{dm.description}</TableCell>
                                <TableCell>{dm.budget}</TableCell>
                                <TableCell>{dm.startDate}</TableCell>
                                <TableCell>{dm.endDate}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(dm)}><EditIcon fontSize="small"/></IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(dm.id)}><DeleteIcon fontSize="small"/></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit DM' : 'New DM'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal" fullWidth label="Code" required
                        value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    />
                    <TextField
                        margin="normal" fullWidth label="Description"
                        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <TextField
                        margin="normal" fullWidth label="Budget" type="number" required
                        value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    />
                    <TextField
                        margin="normal" fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }}
                        value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    />
                    <TextField
                        margin="normal" fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }}
                        value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!form.code || !form.description}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
