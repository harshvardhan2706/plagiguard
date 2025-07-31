import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Navbar from './Navbar';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.id || !storedUser.token) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setErrorMessage('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setFile(null);
      setErrorMessage('File size exceeds 10MB limit. Please select a smaller file.');
      return;
    }

    if (isValidFileType(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
      setErrorMessage('Please select a valid file type (.txt, .doc, .docx, or .pdf)');
    }
  };

  const isValidFileType = (file) => {
    const validTypes = ['.txt', '.doc', '.docx', '.pdf'];
    return validTypes.some(type => file.name.toLowerCase().endsWith(type));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage("Please log in to upload files");
      navigate('/login');
      return;
    }

    if (!file) {
      setErrorMessage("Please select a file first");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user.email);

    try {
      let retryCount = 3;
      let uploadError = null;

      while (retryCount > 0) {
        try {
          const res = await api.post(
            `/api/files/upload/user?userId=${user.id}`, 
            formData, 
            {
              headers: {
                "Authorization": `Bearer ${user.token}`
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setUploadProgress(percentCompleted);
                }
              }
            }
          );

          if (res.data && res.data.success) {
            navigate("/result", { state: res.data });
            return;
          } else {
            throw new Error(res.data?.message || "Upload failed");
          }
        } catch (err) {
          uploadError = err;
          retryCount--;

          if (err.response?.status === 401) {
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login');
            return;
          }

          if (retryCount > 0) {
            setErrorMessage(`Upload failed. Retrying... (${retryCount} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      console.error("Upload failed after retries:", uploadError);

      let errorMessage = "Upload failed. ";
      if (uploadError.response?.status === 413) {
        errorMessage += "File is too large. Maximum size is 10MB.";
      } else if (uploadError.response?.status === 415) {
        errorMessage += "Invalid file type. Please select a supported format.";
      } else {
        errorMessage += uploadError.response?.data?.message || 
                       uploadError.message || 
                       "Please try again.";
      }
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Upload Document</h4>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <p className="lead">Upload a file to check for AI-generated content</p>
                  <small className="text-muted">Supported formats: .txt, .doc, .docx, .pdf</small>
                </div>

                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}

                <div className="mb-4">
                  <div className="custom-file">
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".txt,.docx,.doc,.pdf" 
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </div>
                </div>                
                {file && (
                  <div className="mb-3">
                    <p className="mb-1">Selected file: <strong>{file.name}</strong></p>
                    <p className="text-muted mb-0">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB 
                      <span className="text-success ms-2">
                        <i className="bi bi-check-circle-fill"></i> Valid file
                      </span>
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="mb-3">
                    <label className="form-label d-flex justify-content-between">
                      <span>Upload Progress</span>
                      <span className="text-muted">{uploadProgress}%</span>
                    </label>
                    <div className="progress" style={{ height: "20px" }}>
                      <div 
                        className={`progress-bar progress-bar-striped progress-bar-animated ${
                          uploadProgress < 100 ? 'bg-primary' : 'bg-success'
                        }`}
                        role="progressbar" 
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                      </div>
                    </div>
                    {uploadProgress === 100 && (
                      <small className="text-muted mt-1 d-block">
                        Analyzing document for AI content...
                      </small>
                    )}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleUpload}
                    disabled={loading || !file}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Analyzing...
                      </>
                    ) : (
                      'Upload & Analyze'
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="card mt-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Recent Activity</h5>
                <p className="card-text">
                  View your recent document analysis history and statistics in the{' '}
                  <a href="/history">History</a> section.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
