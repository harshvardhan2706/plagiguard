import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
      try {
      console.log('Attempting login...');
      const res = await api.post('/api/users/login', {
        email,
        password
      });
      
      console.log('Login response:', res.data);
      
      if (res.data && res.data.token) {
        // Store user info
        localStorage.setItem('user', JSON.stringify(res.data));
        localStorage.setItem('userEmail', res.data.email);
        navigate('/dashboard');
      } else {
        console.error('Invalid response format:', res.data);
        throw new Error(res.data?.error || 'Invalid response from server: missing token');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Server error. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <div className="card shadow border-0">
          <div className="card-body p-5">
            <h2 className="text-center text-primary mb-4">PlagiGuard Login</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="email">Email address</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
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

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-decoration-none text-primary"
                >
                  Forgot Password?
                </Link>
              </div>

              <hr className="my-4" />

              <p className="text-center mb-0">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-decoration-none text-primary fw-bold"
                >
                  Register here
                </Link>
              </p>

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
      
      <style>{`
        .form-floating>.form-control {
          height: calc(3.5rem + 2px);
          padding: 1rem 0.75rem;
        }
        .btn-primary {
          background-color: #0D6EFD;
          border-color: #0D6EFD;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }
        .alert {
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default LoginForm;
