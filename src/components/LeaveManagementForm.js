import React from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, IconButton, Paper, Typography
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LeaveService from '../services/leaveService';
import '../styles/LeaveManagement.css';

export default function LeaveManagementForm({leaves, managerId, onRefresh}) {
    const handleApprove = async (leaveId) => {
        await LeaveService.updateSubordinateStatus(managerId, leaveId, 'APPROVED');
        onRefresh();
    };

    const handleReject = async (leaveId) => {
        await LeaveService.updateSubordinateStatus(managerId, leaveId, 'REJECTED');
        onRefresh();
    };

    if (!leaves.length) {
        return <Typography className="lm-no-data">No pending leaves.</Typography>;
    }

    return (
        <Paper className="lm-table-container">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leaves.map(l => (
                        <TableRow key={l.id}>
                            <TableCell>{l.user.firstName} {l.user.lastName}</TableCell>
                            <TableCell>{l.date}</TableCell>
                            <TableCell>{l.leaveType}</TableCell>
                            <TableCell className={l.leaveStatus === 'APPROVED' ? 'lm-status-approved' : ''}>
                                {l.leaveStatus}
                            </TableCell>
                            <TableCell align="right">
                                {l.leaveStatus === 'PENDING' && (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleApprove(l.id)}
                                            sx={{ backgroundColor: 'transparent !important' }}
                                        >
                                            <CheckIcon/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleReject(l.id)}
                                            sx={{ backgroundColor: 'transparent !important' }}
                                        >
                                            <CloseIcon/>
                                        </IconButton>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
