// src/pages/WorkOrdersPage.js
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
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    DoneAll as ApproveIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axiosInstance';

export default function WorkOrdersPage({ refreshErrors }) {
    const [workOrders, setWorkOrders] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({
        id: null,
        code: '',
        title: '',
        companyId: '',
        pm: '',
        budget: '',
        status: 'PENDING_APPROVAL',
        description: '',
        startDate: '',
        endDate: '',
        deadline: ''
    });

    const statuses = ['PENDING_APPROVAL', 'APPROVED', 'CANCELED', 'CLOSED'];

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const token = localStorage.getItem('authToken');
        try {
            const [woRes, compRes] = await Promise.all([
                axiosInstance.get('/api/workorders', { headers: { Authorization: `Bearer ${token}` } }),
                axiosInstance.get('/api/companies', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setWorkOrders(woRes.data);
            setCompanies(compRes.data);
        } catch (err) {
            console.error('Failed to fetch work orders or companies', err);
        }
    }

    const handleOpen = (wo = null) => {
        if (wo) {
            setForm({
                id: wo.id,
                code: wo.code || '',
                title: wo.title || '',
                companyId: wo.company?.id || '',
                pm: wo.pm || '',
                budget: wo.budget || '',
                status: wo.status || 'PENDING_APPROVAL',
                description: wo.description || '',
                startDate: wo.startDate || '',
                endDate: wo.endDate || '',
                deadline: wo.deadline || ''
            });
        } else {
            setForm({
                id: null,
                code: '',
                title: '',
                companyId: '',
                pm: '',
                budget: '',
                status: 'PENDING_APPROVAL',
                description: '',
                startDate: '',
                endDate: '',
                deadline: ''
            });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = {
            code: form.code,
            title: form.title,
            company: { id: form.companyId },
            pm: form.pm,
            budget: parseFloat(form.budget),
            status: form.status,
            description: form.description,
            startDate: form.startDate,
            endDate: form.endDate,
            deadline: form.deadline
        };
        try {
            if (form.id) {
                await axiosInstance.put(`/api/workorders/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axiosInstance.post('/api/workorders', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            setOpenDialog(false);
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to save work order', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this work order?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(`/api/workorders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to delete work order', err);
        }
    };

    const handleApprove = async (id) => {
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.put(`/api/workorders/${id}/status?newStatus=APPROVED`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to approve work order', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>Add Work Order</Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>PM</TableCell>
                            <TableCell>Budget</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Start</TableCell>
                            <TableCell>End</TableCell>
                            <TableCell>Deadline</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workOrders.map((wo) => (
                            <TableRow key={wo.id}>
                                <TableCell>{wo.code}</TableCell>
                                <TableCell>{wo.title}</TableCell>
                                <TableCell>{wo.company?.name}</TableCell>
                                <TableCell>{wo.pm}</TableCell>
                                <TableCell>{wo.budget}</TableCell>
                                <TableCell>{wo.status}</TableCell>
                                <TableCell>{wo.startDate}</TableCell>
                                <TableCell>{wo.endDate}</TableCell>
                                <TableCell>{wo.deadline}</TableCell>
                                <TableCell align="right">
                                    {wo.status === 'PENDING_APPROVAL' && (
                                        <IconButton size="small" onClick={() => handleApprove(wo.id)}>
                                            <ApproveIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <IconButton size="small" onClick={() => handleOpen(wo)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(wo.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Work Order' : 'New Work Order'}</DialogTitle>
                <DialogContent>
                    <TextField margin="normal" fullWidth label="Code" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                    <TextField margin="normal" fullWidth label="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    <TextField select margin="normal" fullWidth label="Company" required value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}>
                        {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </TextField>
                    <TextField margin="normal" fullWidth label="PM" value={form.pm} onChange={e => setForm(f => ({ ...f, pm: e.target.value }))} />
                    <TextField margin="normal" fullWidth label="Budget" type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                    <TextField select margin="normal" fullWidth label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <TextField margin="normal" fullWidth label="Description" multiline rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    <TextField margin="normal" fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                    <TextField margin="normal" fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                    <TextField margin="normal" fullWidth label="Deadline" type="date" InputLabelProps={{ shrink: true }} value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!form.code || !form.title || !form.companyId}>Save</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}