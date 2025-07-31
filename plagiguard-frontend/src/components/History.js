import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Navbar from './Navbar';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    aiScoreMin: '',
    aiScoreMax: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user?.id || !user?.token) {
          navigate('/login');
          return;
        }        const response = await api.get(`/api/files/history/${user.id}`);        console.log('History response:', response.data);
        if (response.data?.uploads) {
          const uploads = response.data.uploads.map(upload => ({
            id: upload.id,
            fileName: upload.filename,
            similarityScore: upload.percentAI / 100, // Convert from percentage to decimal
            uploadDate: upload.timestamp
          }));          const sortedData = uploads.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setUploads(sortedData);
          setFilteredUploads(sortedData);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.response?.data?.message || 'Failed to load upload history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...uploads];

    // Text search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(upload => 
        upload.fileName.toLowerCase().includes(searchTerm)
      );
    }

    // AI score range filter
    if (filters.aiScoreMin) {
      filtered = filtered.filter(upload => 
        upload.similarityScore >= Number(filters.aiScoreMin)
      );
    }
    if (filters.aiScoreMax) {
      filtered = filtered.filter(upload => 
        upload.similarityScore <= Number(filters.aiScoreMax)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(upload =>
        new Date(upload.uploadDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(upload =>
        new Date(upload.uploadDate) <= new Date(filters.dateTo)
      );
    }

    setFilteredUploads(filtered);
  }, [filters, uploads]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // View result details
  const handleViewResult = (upload) => {
    navigate('/result', { state: upload });
  };

  // Get data for the trend chart
  const getChartData = () => {
    const sortedUploads = [...filteredUploads].sort((a, b) => 
      new Date(a.uploadDate) - new Date(b.uploadDate)
    );

    return {
      labels: sortedUploads.map(upload => 
        new Date(upload.uploadDate).toLocaleDateString()
      ),
      datasets: [{
        label: 'AI Content %',
        data: sortedUploads.map(upload => Math.round(upload.similarityScore * 100)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }]
    };
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Upload History</h4>
          </div>
          <div className="card-body">
            {/* Filters */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by filename"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min AI %"
                  name="aiScoreMin"
                  value={filters.aiScoreMin}
                  onChange={handleFilterChange}
                  min="0"
                  max="100"
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max AI %"
                  name="aiScoreMax"
                  value={filters.aiScoreMax}
                  onChange={handleFilterChange}
                  min="0"
                  max="100"
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {filteredUploads.length === 0 ? (
                  <div className="alert alert-info">
                    No upload history found.
                  </div>
                ) : (
                  <>
                    {/* AI Content Trend Chart */}
                    <div className="mb-4">
                      <h5>AI Content Trend</h5>
                      <div style={{ height: '300px' }}>
                        <Line 
                          data={getChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                  display: true,
                                  text: 'AI Content %'
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: 'Upload Date'
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>AI Content %</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUploads.map((upload, index) => (
                            <tr key={upload.id || index}>
                              <td>{upload.fileName}</td>
                              <td>
                                <div className="progress" style={{ height: '20px' }}>
                                  <div
                                    className={`progress-bar ${
                                      upload.similarityScore * 100 > 70 ? 'bg-danger' : 'bg-success'
                                    }`}
                                    role="progressbar"
                                    style={{ width: `${upload.similarityScore * 100}%` }}
                                  >
                                    {Math.round(upload.similarityScore * 100)}%
                                  </div>
                                </div>
                              </td>
                              <td>{new Date(upload.timestamp).toLocaleString()}</td>
                              <td>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleViewResult(upload)}
                                >
                                  View Result
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default History;
