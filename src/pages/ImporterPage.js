// src/components/ImporterPage.js
import React, { useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import {
    Box,
    Button,
    Typography,
    Input,
    CircularProgress,
    Backdrop,
    Snackbar,
    Alert
} from '@mui/material';

function ImporterPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    const handleImport = async () => {
        if (!selectedFile) {
            setSnackbarMessage('Please select a file first.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setLoading(true);

            await axiosInstance.post('/api/admin/importTimeRegData', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            setSnackbarMessage('Import completed successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Import failed:', error);
            setLoading(false);
            setSnackbarMessage('Import failed. See console.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    return (
        <Box p={4}>
            <Typography variant="h5" gutterBottom>Import TimeReg Data</Typography>

            <Input type="file" onChange={handleFileChange} />

            <Button
                variant="contained"
                onClick={handleImport}
                sx={{ mt: 2 }}
            >
                Start Import
            </Button>

            <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ImporterPage;
