
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo/plagiguard.png';
import { Navbar as RBNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';


function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <RBNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <RBNavbar.Brand href="/dashboard" className="d-flex align-items-center">
          <img
            src={logo}
            alt="PlagiGuard Logo"
            className="me-2"
            style={{ height: '40px', width: 'auto' }}
          />
          PlagiGuard
        </RBNavbar.Brand>
        <RBNavbar.Toggle aria-controls="navbarNav" />
        <RBNavbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/history">History</Nav.Link>
            <Nav.Link href="/profile">Profile</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              Welcome, {user.fullName}
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

export default Navbar;
