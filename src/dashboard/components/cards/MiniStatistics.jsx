import React from 'react';
import { Card, CardBody } from 'react-bootstrap';
import './MiniStatistics.css';

const MiniStatistics = ({ 
  startContent, 
  endContent, 
  name, 
  growth, 
  value,
  className = '',
  ...props 
}) => {
  return (
    <Card className={`mini-statistics-card ${className}`} {...props}>
      <CardBody className="p-3">
        <div className="d-flex align-items-center h-100">
          {startContent && (
            <div className="start-content me-3">
              {startContent}
            </div>
          )}
          
          <div className="stat-content flex-grow-1">
            <div className="stat-label text-muted small mb-1">
              {name}
            </div>
            <div className="stat-number h4 mb-0 text-dark">
              {value}
            </div>
            {growth && (
              <div className="d-flex align-items-center mt-1">
                <span className="text-success small fw-bold me-2">
                  {growth}
                </span>
                <span className="text-muted small">
                  since last month
                </span>
              </div>
            )}
          </div>
          
          {endContent && (
            <div className="end-content ms-auto">
              {endContent}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MiniStatistics;