import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import api from '../../api/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc',
    status: 'all'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (!admin.id) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [navigate, filters]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users', { params: filters });
      // Ensure we always have an array, even if the API returns null or undefined
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error:', err);
      setUsers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  // Safe filtering: ensure users is an array and handle missing properties
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!user) return false;
    const searchLower = search.toLowerCase();
    return (user.fullName?.toLowerCase()?.includes(searchLower) || false) ||
           (user.email?.toLowerCase()?.includes(searchLower) || false);
  }) : [];

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h2>User Management</h2>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer' }}>
                        Name
                        {filters.sortBy === 'full_name' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                        Email
                        {filters.sortBy === 'email' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                        Joined
                        {filters.sortBy === 'created_at' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id || Math.random()}>
                          <td>{user.fullName || 'N/A'}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className={`badge bg-${user.status === 'active' ? 'success' : 'danger'}`}>
                              {user.status || 'unknown'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                disabled={!user.id}
                              >
                                View
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                disabled={!user.id}
                              >
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          {search ? 'No users match your search' : 'No users found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserManagement;
