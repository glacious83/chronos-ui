// src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import AdminForm from '../components/AdminForm';
import UsersList from '../components/UsersList';
import axiosInstance from '../services/axiosInstance';
import '../styles/Admin.css';
import ImporterPage from "./ImporterPage";

function AdminPage() {
    const [errors, setErrors] = useState({});
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
            <AdminForm errors={errors} setSelectedMenu={setSelectedMenu} />
            <div className="admin-content">
                {selectedMenu === 'Users List' && <UsersList users={users} />}
                {selectedMenu === 'Importer' && <ImporterPage />}
                {selectedMenu === '' && <h4>Admin Dashboard</h4>}

            </div>
        </div>
    );
}

export default AdminPage;
