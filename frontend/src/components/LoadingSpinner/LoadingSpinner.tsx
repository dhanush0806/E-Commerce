import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner: React.FC<{ fullScreen?: boolean; message?: string }> = ({
  fullScreen = false,
  message = 'Loading...',
}) => {
  return (
    <div className={`spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner-ring"></div>
      {message && <p className="spinner-msg">{message}</p>}
    </div>
  );
};
