// src/components/ReportsForm.js
import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Backdrop,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axiosInstance from '../services/axiosInstance';

export default function ReportsForm() {
    const [department, setDepartment] = useState('911');
    const [year, setYear]           = useState(new Date().getFullYear());
    const [month, setMonth]         = useState(new Date().getMonth() + 1);
    const [loading, setLoading]     = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const downloadReport = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(
                '/api/reports/monthly-records',
                { params: { department, year, month } }
            );

            // transform data: replace LEAVE marker, then add empty placeholders
            const transformed = data.map(item => {
                const copy = { ...item };
                if (copy.projectNumber === 'LEAVE') {
                    copy.projectNumber = 'OOO';
                    copy.projectName = 'Άδεια';
                }
                return copy;
            });

            // headers: inserted Contract, WO, Request Status before NBG It Unit
            const headers = [
                'Date', 'Vendor Name', 'Resource Surname', 'Resource Name',
                'SAP#', 'Profile', 'Contract', 'WO', 'Request Status',
                'NBG It Unit', 'NBG Requestor Name', 'Project #', 'Project Name', 'Actuals'
            ];
            const sheetData = [
                headers,
                ...transformed.map(row => [
                    row.date,
                    row.vendorName,
                    row.resourceSurname,
                    row.resourceName,
                    row.sapNumber,
                    row.profile,
                    '',       // Contract
                    '',       // WO
                    '',       // Request Status
                    row.nbgItUnit,
                    row.nbgRequestorName,
                    row.projectNumber,
                    row.projectName,
                    row.actuals
                ])
            ];

            // create sheet
            const ws = XLSX.utils.aoa_to_sheet(sheetData);

            // auto-size columns
            const colCount = headers.length;
            const colWidths = Array(colCount).fill(0);
            sheetData.forEach(row => {
                row.forEach((val, idx) => {
                    const len = val != null ? val.toString().length : 0;
                    if (len > colWidths[idx]) colWidths[idx] = len;
                });
            });
            ws['!cols'] = colWidths.map(w => ({ wch: w + 2 }));

            // header styles: re-use original fills, add white for new columns
            const fills = [
                '00C05000', // A: Date
                '00DDEBF7', // B: Vendor Name
                '00FCD5B4', // C: Resource Surname
                '00B7DEE8', // D: Resource Name
                '00FFF2CC', // E: SAP#
                '00FFFFFF', // F: Profile
                '00FFFFFF', // G: Contract
                '00FFFFFF', // H: WO
                '00FFFFFF', // I: Request Status
                '00C6E0B4', // J: NBG It Unit
                '00FFF2CC', // K: NBG Requestor Name
                '00D9D9D9', // L: Project #
                '00FFFFFF', // M: Project Name
                '00FFFFFF'  // N: Actuals
            ];
            headers.forEach((_, col) => {
                const address = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[address]) return;
                ws[address].s = {
                    fill: { patternType: 'solid', fgColor: { rgb: fills[col] } },
                    font: { bold: true }
                };
            });

            // workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
            const filename = `report_${department}_${year}_${month}.xlsx`;
            saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);

        } catch (err) {
            setSnackbarMessage(err.response?.data?.message || err.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={4} sx={{ maxWidth: 600, margin: '0 auto' }}>
            <Typography variant="h5" gutterBottom>
                Export Monthly Records
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Dept Code"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                />
                <TextField
                    label="Year"
                    type="number"
                    value={year}
                    onChange={e => setYear(+e.target.value)}
                    InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                />
                <FormControl>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={month}
                        label="Month"
                        onChange={e => setMonth(+e.target.value)}
                    >
                        {[...Array(12)].map((_, i) => (
                            <MenuItem key={i+1} value={i+1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    onClick={downloadReport}
                    sx={{ alignSelf: 'flex-end' }}
                    disabled={loading}
                >
                    {loading ? 'Downloading…' : 'Download Report'}
                </Button>
            </Box>

            <Backdrop open={loading} sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
