import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
            <Link to="/home" style={{ marginRight: '1rem' }}>Home</Link>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        </nav>
    );
}

export default NavBar;
