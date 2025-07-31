import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../api/api';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      navigate('/');
      return;
    }
    setUser(userData);
    setFormData(prev => ({
      ...prev,
      fullName: userData.fullName || '',
      email: userData.email || ''
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ text: 'New passwords do not match', type: 'danger' });
          setLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          setMessage({ text: 'Current password is required to change password', type: 'danger' });
          setLoading(false);
          return;
        }
      }

      // Prepare request data
      const requestData = {
        userId: user.id,
        fullName: formData.fullName?.trim()
      };

      // Add password data if updating password
      if (formData.newPassword) {
        requestData.currentPassword = formData.currentPassword;
        requestData.newPassword = formData.newPassword;
      }

      console.log('Sending update request:', { ...requestData, newPassword: '[REDACTED]' });

      const response = await api.put('/users/profile', requestData);
      console.log('Update response:', response.data);

      if (response.data.user) {
        // Update local storage with new user data
        const updatedUser = {
          ...user,
          ...response.data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          fullName: response.data.user.fullName
        }));

        setMessage({
          text: 'Profile updated successfully. Redirecting...',
          type: 'success'
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500); // 1.5 second delay to show the success message
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({
        text: error.response?.data?.error || 'Failed to update profile. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Profile Settings</h4>
              </div>
              <div className="card-body">
                {message.text && (
                  <div className={`alert alert-${message.type}`} role="alert">
                    {message.text}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <hr className="my-4" />
                  <h5>Change Password</h5>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required={!!formData.newPassword}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      minLength="6"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
