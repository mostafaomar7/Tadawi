import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="text-success" />;
      case 'error':
        return <MdError className="text-danger" />;
      case 'warning':
        return <MdWarning className="text-warning" />;
      default:
        return <MdInfo className="text-info" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`toast-notification ${getBgClass()} text-white`}>
      <div className="d-flex align-items-center">
        <div className="me-3">
          {getIcon()}
        </div>
        <div className="flex-grow-1">
          <strong>{message}</strong>
        </div>
        <button 
          type="button" 
          className="btn-close btn-close-white ms-3"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
        ></button>
      </div>
    </div>
  );
};

export default Toast;
