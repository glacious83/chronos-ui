// src/components/AdminForm.js
import React, {useState} from 'react';
import {Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Badge} from '@mui/material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import '../styles/Admin.css';

const menuItems = [
    { text: 'Users', icon: <PeopleIcon/>, errorKey: 'userError', subItems: ['Users List', 'Approve/Activate Users', 'Leave Management'] },
    {text: 'Departments', icon: <ApartmentIcon/>, errorKey: 'departmentError', subItems: []},
    {text: 'Rates', icon: <MonetizationOnIcon/>, errorKey: 'rateError', subItems: []},
    {text: 'Work Orders', icon: <WorkIcon/>, errorKey: 'workOrderError', subItems: []},
    {text: 'Locations', icon: <LocationOnIcon/>, errorKey: 'locationError', subItems: []},
    {text: 'Calendar Settings', icon: <CalendarTodayIcon/>, errorKey: 'holidayError', subItems: []},
    {text: 'DMs', icon: <DashboardIcon/>, errorKey: 'dmError', subItems: []},
    {text: 'Contracts', icon: <WorkIcon/>, errorKey: 'contractError', subItems: []},
    {text: 'Companies', icon: <BusinessIcon/>, errorKey: 'companyError', subItems: []},
    {text: 'Importer', icon: <ImportExportIcon/>, errorKey: null, subItems: []},
];

function AdminForm({errors, setSelectedMenu}) {
    const [open, setOpen] = useState({});

    const handleClick = (text) => {
        setOpen((prev) => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    const handleSubItemClick = (subItem) => {
        setSelectedMenu(subItem);
    };

    return (
        <Drawer
            variant="permanent"
            className="admin-drawer"
            classes={{paper: 'admin-drawer-paper'}}
        >
            <List>
                {Array.isArray(menuItems) && menuItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <ListItemButton
                            onClick={() => item.subItems.length > 0 ? handleClick(item.text) : setSelectedMenu(item.text)}>
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
                            <ListItemText primary={item.text}/>
                            {item.subItems.length > 0 ? (open[item.text] ? <ExpandLess/> : <ExpandMore/>) : null}
                        </ListItemButton>
                        <Collapse in={open[item.text]} timeout="auto" unmountOnExit>
                            {item.subItems.length > 0 && (
                                <List component="div" disablePadding>
                                    {item.subItems.map((subItem) => (
                                        <ListItemButton key={subItem} sx={{pl: 4}}
                                                        onClick={() => handleSubItemClick(subItem)}>
                                            <ListItemText primary={subItem}/>
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>
        </Drawer>
    );
}

export default AdminForm;