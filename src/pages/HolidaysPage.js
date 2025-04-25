// src/pages/HolidaysPage.js
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
    Switch,
    FormControlLabel,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import axiosInstance from '../services/axiosInstance';

export default function HolidaysPage({ refreshErrors }) {
    const [holidays, setHolidays] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', date: '', halfDay: false, specialDayType: 'NORMAL' });

    const specialTypes = ['NORMAL', 'SATURDAY', 'SUNDAY', 'GREEK_HOLIDAY', 'HALF_DAY'];

    useEffect(() => {
        fetchHolidays();
    }, []);

    async function fetchHolidays() {
        const token = localStorage.getItem('authToken');
        try {
            const res = await axiosInstance.get('/api/holidays', { headers: { Authorization: `Bearer ${token}` } });
            setHolidays(res.data);
        } catch (err) {
            console.error('Failed to fetch holidays', err);
        }
    }

    const handleOpen = holiday => {
        if (holiday) {
            setForm({
                id: holiday.id,
                name: holiday.name,
                date: holiday.date,
                halfDay: holiday.halfDay,
                specialDayType: holiday.specialDayType
            });
        } else {
            setForm({ id: null, name: '', date: '', halfDay: false, specialDayType: 'NORMAL' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = {
            name: form.name,
            date: form.date,
            halfDay: form.halfDay,
            specialDayType: form.specialDayType
        };
        try {
            if (form.id) {
                await axiosInstance.put(
                    `/api/holidays/${form.id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axiosInstance.post(
                    '/api/holidays',
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            handleClose();
            fetchHolidays();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Error saving holiday', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this holiday?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(
                `/api/holidays/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchHolidays();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Error deleting holiday', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>Add Holiday</Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Half Day</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {holidays.map(h => (
                            <TableRow key={h.id}>
                                <TableCell>{h.name}</TableCell>
                                <TableCell>{h.date}</TableCell>
                                <TableCell>{h.halfDay ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{h.specialDayType}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(h)}><EditIcon fontSize="small"/></IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(h.id)}><DeleteIcon fontSize="small"/></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Holiday' : 'New Holiday'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Name"
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        required
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.halfDay}
                                onChange={e => setForm(f => ({ ...f, halfDay: e.target.checked }))}
                            />
                        }
                        label="Half Day"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={form.specialDayType}
                            label="Type"
                            onChange={e => setForm(f => ({ ...f, specialDayType: e.target.value }))}
                        >
                            {specialTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!form.name || !form.date}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
