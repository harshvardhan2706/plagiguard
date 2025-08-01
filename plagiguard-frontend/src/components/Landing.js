import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo/plagiguard.png';

function Landing() {
  return (
    <div>
      {/* Project Alert */}
      <div className="alert alert-info mb-0 rounded-0 text-center shadow-sm" role="alert" style={{fontSize: '1.1rem', borderBottom: '2px solid #0d6efd'}}>
        <span style={{fontWeight: 600}}>About PlagiGuard:</span> PlagiGuard is an open-source AI-powered platform for detecting AI-generated and plagiarized content.<br/>
        <span style={{color: '#dc3545', fontWeight: 600}}>
          Notice: The system may require up to 5 minutes to fully activate after periods of inactivity. Please allow a few moments for your first request to process.
        </span>
      </div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="d-flex align-items-center mb-4">
                <img src={logo} alt="PlagiGuard Logo" style={{ height: '60px', width: 'auto' }} className="me-3" />
                <h1 className="display-4 mb-0">PlagiGuard</h1>
              </div>
              <h2 className="mb-4">AI Content Detection Made Simple</h2>
              <p className="lead mb-4">
                Detect AI-generated content with high accuracy using our advanced machine learning algorithms.
                Perfect for educators, content managers, and quality assurance teams.
              </p>
              <Link to="/register" className="btn btn-light btn-lg me-3">
                Start Detection
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Login
              </Link>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img 
                src="https://placehold.co/600x400/0D6EFD/FFF?text=AI+Detection"
                alt="AI Detection Illustration"
                className="img-fluid rounded-3 shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose PlagiGuard?</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-robot display-4 text-primary mb-3"></i>
                  <h3 className="h5">AI Detection</h3>
                  <p className="card-text">
                    Advanced algorithms to detect AI-generated content with high accuracy
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-shield-check display-4 text-primary mb-3"></i>
                  <h3 className="h5">Plagiarism Check</h3>
                  <p className="card-text">
                    Comprehensive plagiarism detection across multiple sources
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-file-earmark-text display-4 text-primary mb-3"></i>
                  <h3 className="h5">Multiple Formats</h3>
                  <p className="card-text">
                    Support for TXT, DOC, DOCX, and PDF file formats
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up display-4 text-primary mb-3"></i>
                  <h3 className="h5">Detailed Analytics</h3>
                  <p className="card-text">
                    In-depth analysis and reporting of content authenticity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Quick Start Guide</h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="timeline">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-primary rounded-circle p-3 me-3">1</span>
                          <h3 className="h5 mb-0">Create an Account</h3>
                        </div>
                        <p className="card-text">Sign up for a free account to start using PlagiGuard</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-primary rounded-circle p-3 me-3">2</span>
                          <h3 className="h5 mb-0">Upload Document</h3>
                        </div>
                        <p className="card-text">Upload your document in any supported format</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-primary rounded-circle p-3 me-3">3</span>
                          <h3 className="h5 mb-0">Analysis</h3>
                        </div>
                        <p className="card-text">Our AI algorithms analyze your content</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-primary rounded-circle p-3 me-3">4</span>
                          <h3 className="h5 mb-0">View Results</h3>
                        </div>
                        <p className="card-text">Get detailed reports and analytics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication CTA */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Get Started?</h2>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg">
              Login
            </Link>
          </div>
          <div className="mt-4">
            <Link to="/admin/login" className="text-muted text-decoration-none small">
              <i className="bi bi-shield-lock me-1"></i>
              Admin Access
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .timeline .badge {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}

export default Landing;
