import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Box, Badge } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ImportExportIcon from '@mui/icons-material/ImportExport';

const menuItems = [
    { text: 'Users', icon: <PeopleIcon />, errorKey: 'userError' },
    { text: 'Departments', icon: <ApartmentIcon />, errorKey: 'departmentError' },
    { text: 'Rates', icon: <MonetizationOnIcon />, errorKey: 'rateError' },
    { text: 'Work Orders', icon: <WorkIcon />, errorKey: 'workOrderError' },
    { text: 'Locations', icon: <LocationOnIcon />, errorKey: 'locationError' },
    { text: 'Calendar Settings', icon: <CalendarTodayIcon />, errorKey: 'holidayError' },
    { text: 'DMs', icon: <DashboardIcon />, errorKey: 'dmError' },
    { text: 'Contracts', icon: <WorkIcon />, errorKey: 'contractError' },
    { text: 'Companies', icon: <BusinessIcon />, errorKey: 'companyError' },
    { text: 'Importer', icon: <ImportExportIcon />, errorKey: null },
];

function AdminForm({ errors }) {
    const [open, setOpen] = useState({});

    const handleClick = (text) => {
        setOpen((prev) => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    return (
        <Box className="admin-container">
            <Drawer
                variant="permanent"
                className="admin-drawer"
                classes={{ paper: 'admin-drawer-paper' }}
            >
                <List>
                    {menuItems.map((item) => (
                        <Box key={item.text}>
                            <ListItemButton onClick={() => handleClick(item.text)}>
                                <ListItemIcon>
                                    <Badge
                                        color="error"
                                        variant={
                                            item.errorKey && errors[item.errorKey] &&
                                            ((Array.isArray(errors[item.errorKey]) && errors[item.errorKey].length > 0) ||
                                                (!Array.isArray(errors[item.errorKey]) && errors[item.errorKey]))
                                                ? 'dot'
                                                : undefined
                                        }
                                    >
                                        {item.icon}
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                                {open[item.text] ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse in={open[item.text]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem sx={{ pl: 4 }}>
                                        <ListItemText primary="Empty for now" />
                                    </ListItem>
                                </List>
                            </Collapse>
                        </Box>
                    ))}
                </List>
            </Drawer>
            <Box className="admin-content">
                <Typography variant="h4">Admin Dashboard</Typography>
            </Box>
        </Box>
    );
}

export default AdminForm;
