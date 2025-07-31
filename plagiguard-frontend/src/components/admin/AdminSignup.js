import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import logo from '../../logo/plagiguard.png';

function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);    try {
      console.log('Sending signup request:', {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: '[REDACTED]'
      });      const response = await api.post('/api/admin/signup', {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email
      });

      if (response.data) {
        alert('Account created successfully! Please login.');
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        console.error('Response error:', err.response);
        errorMessage = err.response.data?.error || 'Server error - please try again';
        if (err.response.status === 409) {
          errorMessage = 'Username or email already exists';
        }
      } else if (err.request) {
        console.error('Request error:', err.request);
        errorMessage = 'Network error - Unable to reach the server. Please check your connection.';
      } else {
        console.error('Error:', err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <div className="card shadow border-0">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <img src={logo} alt="PlagiGuard Logo" style={{ height: '60px', width: 'auto' }} className="mb-3" />
              <h2 className="text-dark">Admin Registration</h2>
            </div>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="username">Username</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="fullName">Full Name</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Email</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 py-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="spinner-border spinner-border-sm me-2" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>



              <div className="text-center mt-3">
                <Link to="/admin/login" className="text-muted text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Admin Page
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;
