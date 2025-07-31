import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-warning">
            No result data found. Please upload a document first.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  const aiPercentage = Math.round(state.similarityScore * 100);
  const humanPercentage = 100 - aiPercentage;

  const chartData = {
    labels: ['AI-Generated', 'Human-Written'],
    datasets: [
      {
        data: [aiPercentage, humanPercentage],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const highlightContent = () => {
    if (!state.content || !state.aiParts) return 'No content to analyze';
    let output = '';
    state.content.split(' ').forEach((word, idx) => {
      if (state.aiParts.includes(idx)) {
        output += `<span class="ai-text">${word}</span> `;
      } else {
        output += `<span class="human-text">${word}</span> `;
      }
    });
    return output;
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('report-content');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`PlagiGuard_Report_${state.fileName}.pdf`);
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5" id="report-content">
        <div className="card">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Analysis Result</h3>
            <button className="btn btn-outline-light" onClick={exportAsPDF}>
              Export as PDF
            </button>
          </div>
          
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <h4>Document Information</h4>
                  <p><strong>File Name:</strong> {state.fileName}</p>
                  <p><strong>Analysis Date:</strong> {new Date().toLocaleString()}</p>
                </div>
                
                <div className="mb-4">
                  <h4>Content Analysis</h4>
                  <p><strong>AI Content Detection:</strong> {aiPercentage}%</p>
                  <p><strong>Human Content Detection:</strong> {humanPercentage}%</p>
                </div>
              </div>
              
              <div className="col-md-6">
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <Pie data={chartData} />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4>Content Review</h4>
              <div className="alert alert-info">
                <small>
                  Highlighted text indicates potential AI-generated content.
                  Please note that this is an automated analysis and may not be 100% accurate.
                </small>
              </div>
              <div 
                className="border p-3 mt-3 content-area"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#fff',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: highlightContent() }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Upload Another File
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>
            View History
          </button>
        </div>
      </div>

      <style>{`
        .ai-text {
          color: #dc3545;  /* Bootstrap red */
          background-color: rgba(220, 53, 69, 0.1);
          padding: 2px 4px;
          border-radius: 3px;
          transition: background-color 0.2s;
        }
        .ai-text:hover {
          background-color: rgba(220, 53, 69, 0.2);
        }
        .human-text {
          color: #0d6efd;  /* Bootstrap blue */
          background-color: rgba(13, 110, 253, 0.1);
          padding: 2px 4px;
          border-radius: 3px;
          transition: background-color 0.2s;
        }
        .human-text:hover {
          background-color: rgba(13, 110, 253, 0.2);
        }
        .content-area {
          line-height: 2;
          font-size: 1.1rem;
          border-radius: 8px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
};

export default Result;
