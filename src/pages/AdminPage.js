// src/pages/AdminPage.js
import React, {useEffect, useState} from 'react';
import AdminForm from '../components/AdminForm';
import UsersList from '../components/UsersList';
import axiosInstance from '../services/axiosInstance';
import '../styles/Admin.css';
import ImporterPage from "./ImporterPage";
import LeaveManagementPage from "./LeaveManagementPage";
import ApprovalsPage from '../pages/ApprovalsPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import LocationsPage from "./LocationsPage";
import WorkOrdersPage from "./WorkOrdersPage";
import DMsPage from "./DMsPage";
import ContractsPage from "./ContractsPage";
import CompaniesPage from "./CompaniesPage";
import RatesPage from "./RatesPage";

function AdminPage() {
    const [errors, setErrors] = useState({});
    // expose fetchErrors for children
    const fetchErrors = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axiosInstance.get('/api/admin/checkErrors', {
                headers: {Authorization: `Bearer ${token}`}
            });
            setErrors(response.data);
        } catch (error) {
            console.error('Error fetching admin errors', error);
        }
    };
    const [users, setUsers] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('');

    useEffect(() => {
        const fetchErrors = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await axiosInstance.get('/api/admin/checkErrors', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setErrors(response.data);
            } catch (error) {
                console.error('Error fetching admin errors', error);
            }
        };

        fetchErrors();
    }, []);

    useEffect(() => {
        if (selectedMenu === 'Users List') {
            const fetchUsers = async () => {
                const token = localStorage.getItem('authToken');
                try {
                    const response = await axiosInstance.get('/api/users', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users', error);
                }
            };

            fetchUsers();
        }
    }, [selectedMenu]);

    return (
        <div className="admin-page-container">
            <AdminForm errors={errors} setSelectedMenu={setSelectedMenu}/>
            <div className="admin-content">
                {selectedMenu === 'Users List' &&
                    <UsersList
                        users={users}
                        setUsers={setUsers}
                        errorUsers={errors.userError || []}
                    />
                }
                {selectedMenu === 'Leave Management' && <LeaveManagementPage/>}
                {selectedMenu === 'Importer' && <ImporterPage/>}
                {selectedMenu === 'Approve/Activate Users' && <ApprovalsPage/>}
                {selectedMenu === 'Departments' && <DepartmentsPage refreshErrors={fetchErrors}/>}
                {selectedMenu === 'Locations' && <LocationsPage refreshErrors={fetchErrors}/>}
                {selectedMenu === 'Work Orders' && <WorkOrdersPage refreshErrors={fetchErrors}/>}
                {selectedMenu === 'DMs' && <DMsPage refreshErrors={fetchErrors}/>}
                {selectedMenu === 'Contracts' && <ContractsPage refreshErrors={fetchErrors}/>}
                {selectedMenu === 'Companies' && <CompaniesPage refreshErrors={fetchErrors}/>}
                {selectedMenu === 'Rates' && <RatesPage refreshErrors={fetchErrors}/>}
                {selectedMenu === '' && <h4>Admin Dashboard</h4>}

            </div>
        </div>
    );
}

export default AdminPage;
