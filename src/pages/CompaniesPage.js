// src/pages/CompaniesPage.js
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
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axiosInstance';

export default function CompaniesPage({ refreshErrors }) {
    const [companies, setCompanies] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', external: false });

    useEffect(() => {
        fetchCompanies();
    }, []);

    async function fetchCompanies() {
        const token = localStorage.getItem('authToken');
        try {
            const res = await axiosInstance.get('/api/companies', { headers: { Authorization: `Bearer ${token}` } });
            setCompanies(res.data);
        } catch (err) {
            console.error('Failed to fetch companies', err);
        }
    }

    const handleOpen = (company = null) => {
        if (company) {
            setForm({
                id: company.id,
                name: company.name,
                external: company.external
            });
        } else {
            setForm({ id: null, name: '', external: false });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const payload = { name: form.name, external: form.external };
        try {
            if (form.id) {
                await axiosInstance.put(`/api/companies/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axiosInstance.post('/api/companies', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            handleClose();
            fetchCompanies();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to save company', err);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this company?')) return;
        const token = localStorage.getItem('authToken');
        try {
            await axiosInstance.delete(`/api/companies/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchCompanies();
            if (refreshErrors) refreshErrors();
        } catch (err) {
            console.error('Failed to delete company', err);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => handleOpen()}>Add Company</Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>External</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companies.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.external ? 'Yes' : 'No'}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(c)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(c.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>{form.id ? 'Edit Company' : 'New Company'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Name"
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.external}
                                onChange={e => setForm(f => ({ ...f, external: e.target.checked }))}
                            />
                        }
                        label="External"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!form.name}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
