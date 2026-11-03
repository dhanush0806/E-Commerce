import React from 'react';
import './Alert.css';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  return (
    <div className={`alert-box alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close-btn" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};
