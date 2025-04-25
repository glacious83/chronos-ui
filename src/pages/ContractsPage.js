// src/pages/ContractsPage.js
import React, { useEffect, useState } from 'react';
import {
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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

export default function ContractsPage({ refreshErrors }) {
    const [contracts, setContracts] = useState([]);
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({
        id: null,
        userId: '',
        contractStartDate: '',
        contractEndDate: '',
        workingHoursStart: '',
        workingHoursEnd: '',
        maxAnnualLeave: '',
        daysOfficePerWeek: '',
        daysHomePerWeek: '',
        trialPeriodMonths: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const token = localStorage.getItem('authToken');
        try {
            const [contractsRes, usersRes] = await Promise.all([
                axiosInstance.get('/api/contracts', { headers: { Authorization: `Bearer ${token}` } }),
                axiosInstance.get('/api/users', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setContracts(contractsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Error fetching contracts or users', err);
        }
    }

    const handleOpen = (contract = null) => {
        if (contract) {
            const fmt = t => String(t).padStart(2, '0');
            const whs = contract.workingHoursStart || {};
            const whe = contract.workingHoursEnd || {};
            setForm({
                id: contract.id,
                userId: contract.user?.id || '',
                contractStartDate: contract.contractStartDate || '',
                contractEndDate: contract.contractEndDate || '',
                workingHoursStart: `${fmt(whs.hour)}:${fmt(whs.minute)}`,
                workingHoursEnd: `${fmt(whe.hour)}:${fmt(whe.minute)}`,
                maxAnnualLeave: contract.maxAnnualLeave || '',
                daysOfficePerWeek: contract.daysOfficePerWeek || '',
                daysHomePerWeek: contract.daysHomePerWeek || '',
                trialPeriodMonths: contract.trialPeriodMonths || ''
            });
        } else {
            setForm({
                id: null,
                userId: '',
                contractStartDate: '',
                contractEndDate: '',
                workingHoursStart: '',
                workingHoursEnd: '',
                maxAnnualLeave: '',
                daysOfficePerWeek: '',
                daysHomePerWeek: '',
                trialPeriodMonths: ''
            });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const [sh, sm] = form.workingHoursStart.split(':').map(Number);
        const [eh, em] = form.workingHoursEnd.split(':').map(Number);
        const payload = {
            userId: +form.userId,
            contractStartDate: form.contractStartDate,
            contractEndDate: form.contractEndDate,
            workingHoursStart: { hour: sh, minute: sm, second: 0, nano: 0 },
            workingHoursEnd: { hour: eh, minute: em, second: 0, nano: 0 },
            maxAnnualLeave: +form.maxAnnualLeave,
            daysOfficePerWeek: +form.daysOfficePerWeek,
            daysHomePerWeek: +form.daysHomePerWeek,
            trialPeriodMonths: +form.trialPeriodMonths
        };
        try {
            if (form.id) {
                await axiosInstance.put(
                    `/api/contracts/${form.id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axiosInstance.post(
                    '/api/contracts',
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            handleClose();
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Error saving contract', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this contract?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(`/api/contracts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Error deleting contract', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>Add Contract</Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Work Start</TableCell>
                            <TableCell>Work End</TableCell>
                            <TableCell>Max Leave</TableCell>
                            <TableCell>Office Days</TableCell>
                            <TableCell>Home Days</TableCell>
                            <TableCell>Trial Months</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contracts.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{c.user?.firstName} {c.user?.lastName}</TableCell>
                                <TableCell>{c.contractStartDate}</TableCell>
                                <TableCell>{c.contractEndDate}</TableCell>
                                <TableCell>{c.workingHoursStart?.hour}:{c.workingHoursStart?.minute}</TableCell>
                                <TableCell>{c.workingHoursEnd?.hour}:{c.workingHoursEnd?.minute}</TableCell>
                                <TableCell>{c.maxAnnualLeave}</TableCell>
                                <TableCell>{c.daysOfficePerWeek}</TableCell>
                                <TableCell>{c.daysHomePerWeek}</TableCell>
                                <TableCell>{c.trialPeriodMonths}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(c)}><EditIcon fontSize="small"/></IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small"/></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Contract' : 'New Contract'}</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        margin="normal"
                        fullWidth
                        label="User"
                        required
                        value={form.userId}
                        onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                    >
                        {users.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        required
                        value={form.contractStartDate}
                        onChange={e => setForm(f => ({ ...f, contractStartDate: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        required
                        value={form.contractEndDate}
                        onChange={e => setForm(f => ({ ...f, contractEndDate: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Working Hours Start"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        required
                        value={form.workingHoursStart}
                        onChange={e => setForm(f => ({ ...f, workingHoursStart: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Working Hours End"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        required
                        value={form.workingHoursEnd}
                        onChange={e => setForm(f => ({ ...f, workingHoursEnd: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Max Annual Leave"
                        type="number"
                        required
                        value={form.maxAnnualLeave}
                        onChange={e => setForm(f => ({ ...f, maxAnnualLeave: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Office Days/Week"
                        type="number"
                        required
                        value={form.daysOfficePerWeek}
                        onChange={e => setForm(f => ({ ...f, daysOfficePerWeek: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Home Days/Week"
                        type="number"
                        required
                        value={form.daysHomePerWeek}
                        onChange={e => setForm(f => ({ ...f, daysHomePerWeek: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Trial Period (months)"
                        type="number"
                        required
                        value={form.trialPeriodMonths}
                        onChange={e => setForm(f => ({ ...f, trialPeriodMonths: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={
                            !form.userId || !form.contractStartDate || !form.contractEndDate ||
                            !form.workingHoursStart || !form.workingHoursEnd
                        }
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
