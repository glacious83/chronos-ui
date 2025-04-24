import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ImporterPage from "./pages/ImporterPage";
import TimeRegPage from "./pages/TimeRegPage";
// import TimeRegPage from './pages/TimeRegPage'; // Placeholder for now

function App() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/import" element={<ImporterPage />} />
                <Route path="/timereg" element={<TimeRegPage />} />
            </Routes>
        </Router>
    );
}

export default App;
