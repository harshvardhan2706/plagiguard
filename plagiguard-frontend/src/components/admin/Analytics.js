import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import api from '../../api/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    documentsByMonth: [],
    aiScoreDistribution: [],
    userGrowth: [],
    uploadTimes: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (!admin.id) {
      navigate('/admin/login');
      return;
    }

    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      // Ensure we have default values for all properties
      setAnalytics({
        documentsByMonth: Array.isArray(response.data?.documentsByMonth) ? response.data.documentsByMonth : [],
        aiScoreDistribution: Array.isArray(response.data?.aiScoreDistribution) ? response.data.aiScoreDistribution : [],
        userGrowth: Array.isArray(response.data?.userGrowth) ? response.data.userGrowth : [],
        uploadTimes: Array.isArray(response.data?.uploadTimes) ? response.data.uploadTimes : []
      });
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const documentUploadData = {
    labels: analytics.documentsByMonth.map(item => item?.month || ''),
    datasets: [{
      label: 'Document Uploads',
      data: analytics.documentsByMonth.map(item => item?.count || 0),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const userGrowthData = {
    labels: analytics.userGrowth.map(item => item?.month || ''),
    datasets: [{
      label: 'New Users',
      data: analytics.userGrowth.map(item => item?.count || 0),
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.1
    }]
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h2>Analytics</h2>
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
          <div className="row g-4">
            {/* Document Uploads Chart */}
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="card-title mb-0">Document Uploads Over Time</h5>
                </div>
                <div className="card-body">
                  {analytics.documentsByMonth.length > 0 ? (
                    <Line data={documentUploadData} options={{ responsive: true }} />
                  ) : (
                    <p className="text-center text-muted">No document upload data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="card-title mb-0">User Growth</h5>
                </div>
                <div className="card-body">
                  {analytics.userGrowth.length > 0 ? (
                    <Line data={userGrowthData} options={{ responsive: true }} />
                  ) : (
                    <p className="text-center text-muted">No user growth data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Score Distribution */}
            <div className="col-md-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="card-title mb-0">AI Score Distribution</h5>
                </div>
                <div className="card-body">
                  {analytics.aiScoreDistribution.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Score Range</th>
                            <th>Number of Documents</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.aiScoreDistribution.map(item => (
                            <tr key={item.range || Math.random()}>
                              <td>{item.range || 'Unknown'}</td>
                              <td>{item.count || 0}</td>
                              <td>{item.percentage || 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted">No AI score distribution data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Times Analysis */}
            <div className="col-md-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="card-title mb-0">Peak Upload Times</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Time Period</th>
                          <th>Number of Uploads</th>
                          <th>Average AI Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.uploadTimes.map(item => (
                          <tr key={item.period}>
                            <td>{item.period}</td>
                            <td>{item.uploads}</td>
                            <td>{item.avgScore}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default Analytics;
