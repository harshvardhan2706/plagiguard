import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../logo/plagiguard.png';

function AdminNavbar() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/admin/dashboard">
          <img 
            src={logo} 
            alt="PlagiGuard Logo" 
            className="me-2"
            style={{ 
              height: '40px',
              width: 'auto'
            }}
          />
          <span>Admin Panel</span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#adminNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users">Users</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/documents">Documents</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/analytics">Analytics</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/settings">Settings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/signup">Add Admin</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              Welcome, {admin.fullName || 'Admin'}
            </span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
