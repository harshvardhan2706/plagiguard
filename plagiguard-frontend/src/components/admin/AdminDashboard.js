import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import api from '../../api/api';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    documentsToday: 0,
    averageAIScore: 0,
    recentDocuments: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (!admin.id) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/api/admin/dashboard/stats');
      // Ensure we have default values for all properties
      setStats({
        totalDocuments: response.data?.totalDocuments || 0,
        totalUsers: response.data?.totalUsers || 0,
        documentsToday: response.data?.documentsToday || 0,
        averageAIScore: response.data?.averageAIScore || 0,
        recentDocuments: response.data?.recentDocuments || []
      });
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h2>Admin Dashboard</h2>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Documents</h5>
                    <p className="card-text display-6">{stats.totalDocuments}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Users</h5>
                    <p className="card-text display-6">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Today's Uploads</h5>
                    <p className="card-text display-6">{stats.documentsToday}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Avg. AI Score</h5>
                    <p className="card-text display-6">{stats.averageAIScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Recent Documents</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>User</th>
                        <th>Upload Date</th>
                        <th>AI Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(stats.recentDocuments) && stats.recentDocuments.length > 0 ? (
                        stats.recentDocuments.map(doc => (
                          <tr key={doc.id || Math.random()}>
                            <td>{doc.fileName || 'Unknown'}</td>
                            <td>{doc.userEmail || 'Unknown'}</td>
                            <td>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleString() : 'Unknown'}</td>
                            <td>
                              <div className="progress" style={{ height: '20px' }}>
                                <div
                                  className={`progress-bar ${(doc.aiScore || 0) > 70 ? 'bg-danger' : 'bg-success'}`}
                                  role="progressbar"
                                  style={{ width: `${doc.aiScore || 0}%` }}
                                >
                                  {doc.aiScore || 0}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">No recent documents found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="card-title mb-0">Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => navigate('/admin/documents')}
                      >
                        Manage Documents
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => navigate('/admin/users')}
                      >
                        Manage Users
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => navigate('/admin/analytics')}
                      >
                        View Analytics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="card-title mb-0">System Status</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        API Status
                        <span className="badge bg-success rounded-pill">Online</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Database
                        <span className="badge bg-success rounded-pill">Connected</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        AI Service
                        <span className="badge bg-success rounded-pill">Running</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;