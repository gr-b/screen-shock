import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isVisible, message = 'Processing your request...' }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner-large"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;