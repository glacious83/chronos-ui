// src/pages/LocationsPage.js
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

export default function LocationsPage({ refreshErrors }) {
    const [locations, setLocations] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({ id: null, cityName: '', country: '', countryCode: '' });

    useEffect(() => {
        fetchLocations();
    }, []);

    async function fetchLocations() {
        const token = localStorage.getItem('authToken');
        try {
            const res = await axiosInstance.get('/api/locations', { headers: { Authorization: `Bearer ${token}` } });
            setLocations(res.data);
        } catch (err) {
            console.error('Failed to fetch locations', err);
        }
    }

    const handleOpen = (loc = { id: null, cityName: '', country: '', countryCode: '' }) => {
        setForm({
            id: loc.id,
            cityName: loc.cityName,
            country: loc.country,
            countryCode: loc.countryCode
        });
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setForm({ id: null, cityName: '', country: '', countryCode: '' });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = { cityName: form.cityName, country: form.country, countryCode: form.countryCode };
        try {
            if (form.id) {
                await axiosInstance.put(`/api/locations/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axiosInstance.post('/api/locations', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            handleClose();
            fetchLocations();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to save location', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this location?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(`/api/locations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchLocations();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to delete location', err);
        }
    };

    return (
        <Paper sx={{ p:2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>
                Add Location
            </Button>
            <TableContainer sx={{ mt:2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>City</TableCell>
                            <TableCell>Country</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {locations.map(loc => (
                            <TableRow key={loc.id}>
                                <TableCell>{loc.cityName}</TableCell>
                                <TableCell>{loc.country}</TableCell>
                                <TableCell>{loc.countryCode}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(loc)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(loc.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Location' : 'New Location'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="City"
                        required
                        value={form.cityName}
                        onChange={e => setForm(f => ({ ...f, cityName: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Country"
                        required
                        value={form.country}
                        onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Country Code"
                        required
                        value={form.countryCode}
                        onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}
                            disabled={!form.cityName || !form.country || !form.countryCode}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
