// src/pages/TimeRegPage.js
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Chip, Divider, Alert, Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import TimeRegService from '../services/timeRegService';
import ProjectService from '../services/projectService';
import '../styles/TimeReg.css';

function TimeRegPage() {
    const userId = parseInt(localStorage.getItem('userId'), 10);

    // start week on Monday
    function getStartOfWeek(date) {
        const d = new Date(date);
        // compute how many days since Monday
        const diff = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - diff);
        return d;
    }

    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [timeEntries, setTimeEntries] = useState({});
    const [projects, setProjects] = useState([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [currentDay, setCurrentDay] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const [entryForm, setEntryForm] = useState({
        projectId: '', hours: '', description: '', workLocation: 'OFFICE'
    });

    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [leaveDay, setLeaveDay] = useState(null);
    const [leaveHours, setLeaveHours] = useState(0);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // build the seven days from Monday → Sunday
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    function formatDate(d) {
        return d.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    }

    function formatDateForApi(d) {
        return d.toISOString().split('T')[0];
    }

    function navigateWeek(dir) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + dir * 7);
        setCurrentWeekStart(d);
    }

    function isToday(d) {
        return d.toDateString() === new Date().toDateString();
    }

    function isWeekend(d) {
        const day = d.getDay();
        return day === 0 || day === 6; // Sunday=0, Saturday=6
    }

    function getTotalHoursForDay(d) {
        const key = formatDateForApi(d);
        return (timeEntries[key]?.reduce((s, e) => s + e.workedHours, 0)) || 0;
    }

    function getTotalOvertimeForDay(d) {
        const key = formatDateForApi(d);
        return (timeEntries[key]?.reduce((s, e) => s + e.overtimeHours, 0)) || 0;
    }

    function isOnLeaveDay(d) {
        const key = formatDateForApi(d);
        return timeEntries[key]?.some(e => e.isLeave) || false;
    }

    async function fetchTimeEntries() {
        try {
            const startDate = formatDateForApi(currentWeekStart);
            const endDate   = formatDateForApi(weekDays[6]);
            const entries   = await TimeRegService.getByRange(userId, startDate, endDate);
            const grouped = {};
            entries.forEach(e => {
                grouped[e.date] = grouped[e.date] || [];
                grouped[e.date].push(e);
            });
            setTimeEntries(grouped);
        } catch {
            setSnackbarMessage('Failed to load time entries');
            setOpenSnackbar(true);
        }
    }

    async function fetchProjects() {
        try {
            setProjects(await ProjectService.getAll());
        } catch {
            setSnackbarMessage('Failed to load projects');
            setOpenSnackbar(true);
        }
    }

    function handleAddClick(d) {
        setCurrentDay(d);
        setEditingEntry(null);
        setEntryForm({ projectId: '', hours: '', description: '', workLocation: 'OFFICE' });
        setOpenDialog(true);
    }

    function handleEditEntry(d, entry) {
        setCurrentDay(d);
        setEditingEntry(entry);
        setEntryForm({
            projectId: entry.project?.id || '',
            hours: entry.workedHours,
            description: entry.description || '',
            workLocation: entry.workLocation
        });
        setOpenDialog(true);
    }

    async function handleDeleteEntry(id) {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await TimeRegService.delete(id);
            await fetchTimeEntries();
            setSnackbarMessage('Entry deleted');
            setOpenSnackbar(true);
        } catch {
            setSnackbarMessage('Failed to delete entry');
            setOpenSnackbar(true);
        }
    }

    async function handleDialogSave() {
        const dateStr   = formatDateForApi(currentDay);
        const hoursNum  = parseFloat(entryForm.hours);
        const prevTotal = getTotalHoursForDay(currentDay);
        const remaining = Math.max(0, 8 - prevTotal);
        const worked    = Math.min(hoursNum, remaining);
        const overtime  = Math.max(0, hoursNum - remaining);

        const payload = {
            userId,
            projectId: parseInt(entryForm.projectId, 10),
            date: dateStr,
            workedHours: worked,
            overtimeHours: overtime,
            workLocation: entryForm.workLocation,
            description: entryForm.description
        };

        try {
            if (editingEntry) {
                await TimeRegService.update(editingEntry.id, payload);
            } else {
                await TimeRegService.create(payload);
            }
            setOpenDialog(false);
            await fetchTimeEntries();
            if (prevTotal + worked < 8) {
                setLeaveDay(currentDay);
                setLeaveHours(8 - (prevTotal + worked));
                setOpenLeaveDialog(true);
            }
        } catch {
            setSnackbarMessage('Failed to save entry');
            setOpenSnackbar(true);
        }
    }

    async function handleAddLeave() {
        const date = formatDateForApi(leaveDay);
        try {
            await TimeRegService.create({
                userId,
                projectId: -1,
                date,
                workedHours: leaveHours,
                overtimeHours: 0,
                workLocation: 'HOME'
            });
            setOpenLeaveDialog(false);
            await fetchTimeEntries();
            setSnackbarMessage('Leave added');
            setOpenSnackbar(true);
        } catch {
            setSnackbarMessage('Failed to add leave');
            setOpenSnackbar(true);
        }
    }

    useEffect(() => {
        fetchTimeEntries();
        fetchProjects();
    }, [currentWeekStart]);

    return (
        <Box className="timereg-container">
            <Box className="timereg-header">
                <Typography variant="h4">Time Registration</Typography>
                <Box className="week-navigation">
                    <IconButton onClick={() => navigateWeek(-1)} sx={{ backgroundColor: 'transparent !important' }}><ChevronLeftIcon/></IconButton>
                    <Typography variant="h6">{`Week of ${currentWeekStart.toLocaleDateString()}`}</Typography>
                    <IconButton onClick={() => navigateWeek(1)} sx={{ backgroundColor: 'transparent !important' }}><ChevronRightIcon/></IconButton>
                </Box>
            </Box>

            <Grid container spacing={2} className="week-grid">
                {weekDays.map(day => {
                    const key     = formatDateForApi(day);
                    const regular = getTotalHoursForDay(day);
                    const ot      = getTotalOvertimeForDay(day);
                    const leave   = isOnLeaveDay(day);
                    const weekend = isWeekend(day);

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={12/7} key={key}>
                            <Paper
                                className={`${weekend ? 'weekend ' : ''}${isToday(day) ? 'today ' : ''}day-card`}
                                elevation={3}
                            >
                                <Box className="day-header">
                                    <Typography variant="h6">{formatDate(day)}</Typography>
                                    <IconButton size="small" onClick={() => handleAddClick(day)} sx={{ backgroundColor: 'transparent !important' }}><AddIcon/></IconButton>
                                </Box>
                                <Divider/>
                                <Box className="day-summary">
                                    <Typography>Hours: <strong>{regular + ot}</strong></Typography>
                                    <Box sx={{ display:'flex', gap:1, mt:0.5 }}>
                                        {ot > 0 && <Chip size="small" color="error" label={`OT: ${ot}h`}/>}
                                        {leave && <Chip size="small" color="info" label="Leave"/>}
                                    </Box>
                                    <Typography sx={{ mt:0.5 }}>Projects: {timeEntries[key]?.length || 0}</Typography>
                                </Box>
                                {timeEntries[key]?.map(entry => (
                                    <Box key={entry.id} className="entry-item">
                                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                                            <Typography variant="body2">
                                                {entry.project?.name || entry.projectId}: {entry.workedHours}h
                                            </Typography>
                                            {entry.overtimeHours > 0 && (
                                                <Chip size="small" color="error" label={`+${entry.overtimeHours}h OT`}/>
                                            )}
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleEditEntry(day, entry)} sx={{ backgroundColor: 'transparent !important' }}><EditIcon fontSize="small"/></IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteEntry(entry.id)} sx={{ backgroundColor: 'transparent !important' }}><DeleteIcon fontSize="small"/></IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Dialogs & Snackbar unchanged */}
        </Box>
    );
}

export default TimeRegPage;
