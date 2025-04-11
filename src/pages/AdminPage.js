// src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import AdminForm from '../components/AdminForm';
import axiosInstance from '../services/axiosInstance';
import '../styles/Admin.css';

function AdminPage() {
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchErrors = async () => {
            try {
                const response = await axiosInstance.get('/api/admin/checkErrors');
                setErrors(response.data);
            } catch (error) {
                console.error('Error fetching admin errors', error);
            }
        };

        fetchErrors();
    }, []);

    return (
        <div className="admin-page-container">
            <AdminForm errors={errors} />
        </div>
    );
}

export default AdminPage;
