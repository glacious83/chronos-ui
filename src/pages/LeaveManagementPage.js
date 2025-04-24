import React, { useState, useEffect } from 'react';
import LeaveManagementForm from '../components/LeaveManagementForm';
import LeaveService from '../services/leaveService';
import { Typography, Box } from '@mui/material';

export default function LeaveManagementPage() {
    const managerId = parseInt(localStorage.getItem('userId'), 10);
    const [leaves, setLeaves] = useState([]);

    const fetchSubordinateLeaves = async () => {
        const data = await LeaveService.getSubordinates(managerId);
        setLeaves(data);
    };

    useEffect(() => {
        fetchSubordinateLeaves();
    }, []);

    return (
        <Box className="lm-page-container">
            <Typography variant="h5" gutterBottom>
                Leave Management
            </Typography>
            <LeaveManagementForm
                leaves={leaves}
                managerId={managerId}
                onRefresh={fetchSubordinateLeaves}
            />
        </Box>
    );
}
