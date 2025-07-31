import React from 'react';
import { useNavigate } from 'react-router-dom';

function ResultViewer() {
  const navigate = useNavigate();
  const result = JSON.parse(localStorage.getItem('result'));

  if (!result) {
    navigate('/dashboard');
    return null;
  }

  const { content, aiParts, percentAI } = result;

  const highlightContent = () => {
    let output = '';
    content.split(' ').forEach((word, idx) => {
      if (aiParts.includes(idx)) {
        output += `<span style="background-color: #ffcccc">${word}</span> `;
      } else {
        output += `${word} `;
      }
    });
    return output;
  };

  return (
    <div className="container mt-5">
      <h4>AI Content Detected: {percentAI}%</h4>
      <div className="border p-3 mt-3" style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: highlightContent() }}>
      </div>
      <button className="btn btn-secondary mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
}

export default ResultViewer;
