import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import logo from '../../logo/plagiguard.png';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');    try {
      console.log('Attempting login with:', { ...formData, password: '[REDACTED]' });
      const response = await api.post('/api/admin/login', formData);
      console.log('Login response:', response.data);
        if (response.data?.token) {
        // Store the admin data including the token
        localStorage.setItem('admin', JSON.stringify({
          ...response.data,
          token: response.data.token
        }));
        navigate('/admin/dashboard');
      } else {
        throw new Error('Invalid response format - no token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        console.error('Response error:', err.response);
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.request) {
        console.error('Request error:', err.request);
        errorMessage = 'Network error - Unable to reach the server';
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
              <h2 className="text-dark">Admin Login</h2>
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

              <div className="form-floating mb-4">
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

              <button
                type="submit"
                className="btn btn-dark w-100 py-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="spinner-border spinner-border-sm me-2" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Removed admin signup link as requested */}

              <div className="text-center mt-3">
                <Link to="/" className="text-muted text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
