// src/components/ApprovalsPage.js
import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, Button, Typography
} from '@mui/material';
import axiosInstance from '../services/axiosInstance';

export default function ApprovalsPage() {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState([]);

    // fetch only users not active OR not approved
    useEffect(() => {
        (async () => {
            const { data } = await axiosInstance.get('/api/users');
            setUsers(data.filter(u => !u.active || !u.approved));
        })();
    }, []);

    const isAllSelected = users.length > 0 && selected.length === users.length;

    function toggleSelectAll(e) {
        setSelected(e.target.checked ? users.map(u => u.id) : []);
    }
    function toggleSelectOne(id) {
        setSelected(sel =>
            sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
        );
    }

    async function massApprove() {
        await Promise.all(selected.map(id =>
            axiosInstance.put(`/api/admin/users/${id}/approve?approved=true`)
        ));
        setUsers(u => u.map(x => selected.includes(x.id) ? { ...x, approved: true } : x));
        setSelected([]);
    }
    async function massActivate() {
        await Promise.all(selected.map(id =>
            axiosInstance.put(`/api/admin/users/${id}/activate?active=true`)
        ));
        setUsers(u => u.map(x => selected.includes(x.id) ? { ...x, active: true } : x));
        setSelected([]);
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Approve / Activate Users
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    disabled={selected.length===0}
                    onClick={massApprove}
                >
                    Approve Selected
                </Button>
                <Button
                    variant="contained"
                    disabled={selected.length===0}
                    onClick={massActivate}
                >
                    Activate Selected
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length>0 && !isAllSelected}
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell>Approved</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(u => {
                            const isSel = selected.includes(u.id);
                            return (
                                <TableRow key={u.id} hover>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isSel}
                                            onChange={() => toggleSelectOne(u.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{u.firstName}</TableCell>
                                    <TableCell>{u.lastName}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{u.active ? '✔️' : '❌'}</TableCell>
                                    <TableCell>{u.approved ? '✔️' : '❌'}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
