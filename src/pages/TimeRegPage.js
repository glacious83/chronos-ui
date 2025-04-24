// src/pages/TimeRegPage.js
import React, {useState, useEffect} from 'react';
import {
    Box, Typography, Paper, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Chip, Divider, Alert, Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    BeachAccess as LeaveIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import TimeRegService from '../services/timeRegService';
import ProjectService from '../services/projectService';
import LeaveService from '../services/leaveService';
import HolidaysService from '../services/holidaysService';
import '../styles/TimeReg.css';

export default function TimeRegPage() {
    const userId = parseInt(localStorage.getItem('userId'), 10);

    // compute Monday as start of week
    function getStartOfWeek(date) {
        const d = new Date(date);
        const diff = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - diff);
        return d;
    }

    function formatDate(displayDate) {
        return displayDate.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    }

    function formatDateForApi(apiDate) {
        return apiDate.toISOString().split('T')[0];
    }

    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [timeEntries, setTimeEntries] = useState({});
    const [leaves, setLeaves] = useState({});
    const [projects, setProjects] = useState([]);
    const [holidays, setHolidays] = useState([]);

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

    // Monday → Sunday
    const weekDays = Array.from({length: 7}, (_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    function isWeekend(d) {
        const day = d.getDay();
        return day === 0 || day === 6;
    }

    function isHoliday(d) {
        const key = formatDateForApi(d);
        return holidays.some(h => h.date === key);
    }

    function isToday(d) {
        return d.toDateString() === new Date().toDateString();
    }

    function getTotalHours(d) {
        const key = formatDateForApi(d);
        return (timeEntries[key]?.reduce((sum, e) => sum + e.workedHours, 0)) || 0;
    }

    function getTotalOvertime(d) {
        const key = formatDateForApi(d);
        return (timeEntries[key]?.reduce((sum, e) => sum + e.overtimeHours, 0)) || 0;
    }

    function hasApprovedFullLeave(d) {
        const key = formatDateForApi(d);
        return (leaves[key]?.some(l =>
            l.leaveType === 'FULL' && l.leaveStatus === 'APPROVED'
        )) || false;
    }

    async function fetchEntries() {
        const startDate = formatDateForApi(currentWeekStart);
        const endDate = formatDateForApi(weekDays[6]);
        const entries = await TimeRegService.getByRange(userId, startDate, endDate);
        const grouped = {};
        entries.forEach(e => {
            grouped[e.date] = grouped[e.date] || [];
            grouped[e.date].push(e);
        });
        setTimeEntries(grouped);
    }

    async function fetchLeaves() {
        const startDate = formatDateForApi(currentWeekStart);
        const endDate = formatDateForApi(weekDays[6]);
        const data = await LeaveService.getWeekly(userId, startDate, endDate);
        const valid = data.filter(l => l.leaveStatus !== 'CANCELED');
        const grouped = {};
        valid.forEach(l => {
            grouped[l.date] = grouped[l.date] || [];
            grouped[l.date].push(l);
        });
        setLeaves(grouped);
    }

    async function fetchProjects() {
        setProjects(await ProjectService.getAll());
    }

    useEffect(() => {
        fetchEntries();
        fetchLeaves();
        fetchProjects();
        fetchHolidays();
    }, [currentWeekStart]);

    function navigateWeek(dir) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + dir * 7);
        setCurrentWeekStart(d);
    }

    function openAddTime(d) {
        setCurrentDay(d);
        setEditingEntry(null);
        setEntryForm({projectId: '', hours: '', description: '', workLocation: 'OFFICE'});
        setOpenDialog(true);
    }

    async function fetchHolidays() {
        const year = currentWeekStart.getFullYear();
        const data = await HolidaysService.getAll(year);
        setHolidays(data);
    }

    function openAddLeave(d) {
        setLeaveDay(d);
        setLeaveHours(8);
        setOpenLeaveDialog(true);
    }

    async function handleDialogSave() {
        const dateStr = formatDateForApi(currentDay);
        const hrs = parseFloat(entryForm.hours);
        const prevTotal = getTotalHours(currentDay);
        const remain = Math.max(0, 8 - prevTotal);
        const worked = Math.min(hrs, remain);
        const ot = Math.max(0, hrs - remain);

        const payload = {
            userId,
            projectId: parseInt(entryForm.projectId, 10),
            date: dateStr,
            workedHours: worked,
            overtimeHours: ot,
            workLocation: entryForm.workLocation,
            description: entryForm.description
        };

        if (editingEntry) {
            await TimeRegService.update(editingEntry.id, payload);
        } else {
            await TimeRegService.create(payload);
        }
        setOpenDialog(false);
        await fetchEntries();
        if (prevTotal + worked < 8) {
            setOpenLeaveDialog(true);
            setLeaveDay(currentDay);
            setLeaveHours(8 - (prevTotal + worked));
        }
    }

    async function handleDeleteEntry(id) {
        await TimeRegService.delete(id);
        await fetchEntries();
    }

    async function handleAddLeave() {
        const dateStr = formatDateForApi(leaveDay);
        const totalWorked = getTotalHours(leaveDay);
        let type;
        if (leaveHours === 8) {
            type = 'FULL';
        } else if (leaveHours === 4) {
            type = totalWorked >= 4 ? 'SECOND_HALF' : 'FIRST_HALF';
        } else {
            type = 'PARTIAL_LEAVE';
        }
        await LeaveService.create({userId, date: dateStr, leaveType: type});
        setOpenLeaveDialog(false);
        await fetchLeaves();
    }

    async function handleCancelLeave(leaveId) {
        await LeaveService.cancel(leaveId, userId);
        await fetchLeaves();
    }

    return (
        <Box className="timereg-container">
            <Box className="timereg-header">
                <Typography variant="h4">Time Registration</Typography>
                <Box className="week-navigation">
                    <IconButton onClick={() => navigateWeek(-1)}
                                sx={{backgroundColor: 'transparent !important'}}><ChevronLeftIcon/></IconButton>
                    <Typography variant="h6">{`Week of ${currentWeekStart.toLocaleDateString()}`}</Typography>
                    <IconButton onClick={() => navigateWeek(1)}
                                sx={{backgroundColor: 'transparent !important'}}><ChevronRightIcon/></IconButton>
                </Box>
            </Box>

            <Box className="week-grid">
                {weekDays.map(day => {
                    const key = formatDateForApi(day);
                    const total = getTotalHours(day);
                    const overtime = getTotalOvertime(day);
                    const fullLeaveApproved = hasApprovedFullLeave(day);
                    const holiday = holidays.find(h => h.date === key);

                    return (
                        <Paper
                            key={key}
                            className={`
                            ${isHoliday(day) ? 'holiday ' : ''}
                            ${isWeekend(day) ? 'weekend ' : ''}
                            ${isToday(day) ? 'today ' : ''}
                            ${hasApprovedFullLeave(day) ? 'full-leave-approved ' : ''}
                            day-card`}
                            elevation={3}
                        >
                            <Box className="day-header">
                                <Typography variant="h6">{formatDate(day)}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => openAddTime(day)}
                                    disabled={fullLeaveApproved || total + overtime >= 8}
                                    sx={{backgroundColor: 'transparent !important'}}
                                ><AddIcon/></IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => openAddLeave(day)}
                                    disabled={fullLeaveApproved}
                                    sx={{backgroundColor: 'transparent !important'}}
                                ><LeaveIcon/></IconButton>
                            </Box>
                            {holiday && (
                                <Box className="holiday-banner">
                                    <Typography variant="subtitle2">
                                        {holiday.name}
                                    </Typography>
                                </Box>
                            )}
                            {fullLeaveApproved && (
                                <Box className="leave-banner">
                                    <Typography variant="subtitle2">
                                        Approved Full-Day Leave
                                    </Typography>
                                </Box>
                            )}
                            <Divider/>
                            <Box className="day-summary">
                                <Typography>Hours: <strong>{total + overtime}</strong></Typography>
                                <Box sx={{display: 'flex', gap: 1, mt: 0.5}}>
                                    {overtime > 0 && <Chip size="small" color="error" label={`OT: ${overtime}h`}/>}
                                </Box>
                                <Typography sx={{mt: 0.5}}>Projects: {timeEntries[key]?.length || 0}</Typography>
                            </Box>
                            {timeEntries[key]?.map(e => (
                                <Box key={e.id} className="entry-item">
                                    <Typography variant="body2">
                                        {e.project?.name || e.projectId}: {e.workedHours}h
                                    </Typography>
                                </Box>
                            ))}
                            {leaves[key]?.map(l => (
                                <Box key={l.id} className="entry-item">
                                    <Chip
                                        label={l.leaveType}
                                        onDelete={() => handleCancelLeave(l.id)}
                                        size="small"
                                        color={l.leaveStatus === 'APPROVED' ? 'success' : 'default'}
                                    />
                                </Box>
                            ))}
                        </Paper>
                    );
                })}
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}</DialogTitle>
                <DialogContent>
                    <TextField
                        select label="Project" fullWidth margin="normal" required
                        value={entryForm.projectId}
                        onChange={e => setEntryForm({...entryForm, projectId: e.target.value})}
                    >
                        {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </TextField>
                    <TextField
                        label="Hours" type="number" fullWidth margin="normal" required
                        inputProps={{min: 0.5, max: 24, step: 0.5}}
                        value={entryForm.hours}
                        onChange={e => setEntryForm({...entryForm, hours: e.target.value})}
                    />
                    <TextField
                        select label="Work Location" fullWidth margin="normal" required
                        value={entryForm.workLocation}
                        onChange={e => setEntryForm({...entryForm, workLocation: e.target.value})}
                    >
                        <MenuItem value="OFFICE">Work from Office</MenuItem>
                        <MenuItem value="HOME">Work from Home</MenuItem>
                    </TextField>
                    <TextField
                        label="Description" fullWidth margin="normal" multiline rows={3}
                        value={entryForm.description}
                        onChange={e => setEntryForm({...entryForm, description: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleDialogSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
                <DialogTitle>Add Leave</DialogTitle>
                <DialogContent>
                    <Alert severity="info">
                        Register {leaveHours}h leave on {leaveDay && formatDate(leaveDay)}?
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLeaveDialog(false)}>No</Button>
                    <Button variant="contained" onClick={handleAddLeave}>Yes</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </Box>
    );
}
