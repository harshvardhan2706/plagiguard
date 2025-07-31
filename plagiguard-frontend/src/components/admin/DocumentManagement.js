import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import api from '../../api/api';

function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'upload_date',
    sortOrder: 'desc',
    aiScoreMin: '',
    aiScoreMax: '',
    dateFrom: '',
    dateTo: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (!admin.id) {
      navigate('/admin/login');
      return;
    }

    fetchDocuments();
  }, [navigate, filters]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/admin/documents', { params: filters });
      // Ensure we always have an array, even if the API returns null or undefined
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error:', err);
      setDocuments([]); // Reset to empty array on error
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

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/admin/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  // Safe filtering with null checks
  const filteredDocuments = Array.isArray(documents) ? documents.filter(doc => {
    if (!doc) return false;
    return doc.fileName?.toLowerCase().includes(search.toLowerCase() || '') ||
           doc.userEmail?.toLowerCase().includes(search.toLowerCase() || '');
  }) : [];

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h2>Document Management</h2>
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
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min AI Score"
                  value={filters.aiScoreMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, aiScoreMin: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max AI Score"
                  value={filters.aiScoreMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, aiScoreMax: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
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
                      <th onClick={() => handleSort('file_name')} style={{ cursor: 'pointer' }}>
                        File Name
                        {filters.sortBy === 'file_name' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('user_email')} style={{ cursor: 'pointer' }}>
                        User
                        {filters.sortBy === 'user_email' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('upload_date')} style={{ cursor: 'pointer' }}>
                        Upload Date
                        {filters.sortBy === 'upload_date' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('ai_score')} style={{ cursor: 'pointer' }}>
                        AI Score
                        {filters.sortBy === 'ai_score' && (
                          <i className={`bi bi-arrow-${filters.sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map(doc => (
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
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(`/api/admin/documents/${doc.id}/download`)}
                                disabled={!doc.id}
                              >
                                Download
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(doc.id)}
                                disabled={!doc.id}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          {search ? 'No documents match your search' : 'No documents found'}
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

export default DocumentManagement;
