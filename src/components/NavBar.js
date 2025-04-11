import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/home">Home</Link>
            <Link to="/login">Login</Link>
        </nav>
    );
}

export default NavBar;