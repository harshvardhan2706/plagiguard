
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../logo/plagiguard.png';
import { Navbar as RBNavbar, Nav, Container } from 'react-bootstrap';


function AdminNavbar() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  return (
    <RBNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <RBNavbar.Brand as={Link} to="/admin/dashboard" className="d-flex align-items-center">
          <img
            src={logo}
            alt="PlagiGuard Logo"
            className="me-2"
            style={{ height: '40px', width: 'auto' }}
          />
          <span>Admin Panel</span>
        </RBNavbar.Brand>
        <RBNavbar.Toggle aria-controls="adminNavbar" />
        <RBNavbar.Collapse id="adminNavbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
            <Nav.Link as={Link} to="/admin/documents">Documents</Nav.Link>
            <Nav.Link as={Link} to="/admin/analytics">Analytics</Nav.Link>
            <Nav.Link as={Link} to="/admin/settings">Settings</Nav.Link>
            <Nav.Link as={Link} to="/admin/signup">Add Admin</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              Welcome, {admin.fullName || 'Admin'}
            </span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
}

export default AdminNavbar;
