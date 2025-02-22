import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardStats from './components/AdminPage';
import Categories from './pages/Categories';
import Events from './pages/Events';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import Login from './auth/Login';
import Logout from './auth/Logout';
import Guests from './pages/Guests';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUserEmail(userData.email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} role="user" onLogout={handleLogout} />
      <div className={`min-h-screen pb-6`}>
        <div className="container mx-auto p-6">
          <br />
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<DashboardStats />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/events" element={<Events />} />
            <Route path="/users" element={<Users />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;