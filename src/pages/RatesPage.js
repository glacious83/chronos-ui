// src/pages/RatesPage.js
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

export default function RatesPage({ refreshErrors }) {
    const [rates, setRates] = useState([]);
    const [titles, setTitles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({ id: null, userTitle: '', rate: '' });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const token = localStorage.getItem('authToken');
        try {
            const [ratesRes, titlesRes] = await Promise.all([
                axiosInstance.get('/api/rates', { headers: { Authorization: `Bearer ${token}` } }),
                axiosInstance.get('/api/rates/titles', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setRates(ratesRes.data);
            setTitles(titlesRes.data);
        } catch (err) {
            console.error('Failed to fetch rates or titles', err);
        }
    }

    const handleOpen = rateObj => {
        if (rateObj) {
            setForm({
                id: rateObj.id,
                userTitle: rateObj.userTitle,
                rate: String(rateObj.rate)
            });
        } else {
            setForm({ id: null, userTitle: '', rate: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setForm({ id: null, userTitle: '', rate: '' });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = { userTitle: form.userTitle, rate: parseFloat(form.rate) };
        try {
            if (form.id) {
                await axiosInstance.put(
                    `/api/rates/${form.id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axiosInstance.post(
                    '/api/rates',
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            handleClose();
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Error saving rate', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this rate?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(
                `/api/rates/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Error deleting rate', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>Add Rate</Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Rate</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rates.map(r => (
                            <TableRow key={r.id}>
                                <TableCell>{r.userTitle}</TableCell>
                                <TableCell>{r.rate}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(r)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(r.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Rate' : 'New Rate'}</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        margin="normal"
                        fullWidth
                        label="Title"
                        required
                        value={form.userTitle}
                        onChange={e => setForm(f => ({ ...f, userTitle: e.target.value }))}
                    >
                        {titles.map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Rate"
                        type="number"
                        required
                        value={form.rate}
                        onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!form.userTitle || form.rate === ''}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
