// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// This function should be replaced with your actual authentication logic
// e.g., checking if a valid token exists in localStorage.
const isAuthenticated = () => {
    return localStorage.getItem('authToken') !== null;
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
