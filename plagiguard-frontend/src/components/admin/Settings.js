import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import api from '../../api/api';

function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    aiThreshold: 70,
    maxFileSize: 10,
    allowedFileTypes: '.txt,.doc,.docx,.pdf',
    backupInterval: 'daily'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (!admin.id) {
      navigate('/admin/login');
      return;
    }

    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/admin/settings', settings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h2>System Settings</h2>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="darkMode"
                          name="darkMode"
                          checked={settings.darkMode}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="darkMode">
                          Dark Mode
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">AI Detection Threshold (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="aiThreshold"
                        value={settings.aiThreshold}
                        onChange={handleChange}
                        min="0"
                        max="100"
                      />
                      <div className="form-text">
                        Content with AI score above this threshold will be flagged as AI-generated
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Maximum File Size (MB)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxFileSize"
                        value={settings.maxFileSize}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Allowed File Types</label>
                      <input
                        type="text"
                        className="form-control"
                        name="allowedFileTypes"
                        value={settings.allowedFileTypes}
                        onChange={handleChange}
                      />
                      <div className="form-text">
                        Comma-separated list of file extensions (e.g., .txt,.doc,.docx,.pdf)
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Database Backup Interval</label>
                      <select
                        className="form-select"
                        name="backupInterval"
                        value={settings.backupInterval}
                        onChange={handleChange}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">System Information</h5>
                  <div className="mb-3">
                    <strong>Version:</strong> 1.0.0
                  </div>
                  <div className="mb-3">
                    <strong>Last Backup:</strong> {new Date().toLocaleString()}
                  </div>
                  <div className="mb-3">
                    <strong>Storage Used:</strong> 45%
                  </div>
                  <div>
                    <strong>Active Users:</strong> 150
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Settings;
