import React from 'react';

export default function MiniStatistics({ startContent, endContent, name, growth, value, bgColor = 'bg-white' }) {
  return (
    <div className={`card ${bgColor} shadow-sm border-0`}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center h-100">
          {startContent && (
            <div className="me-3">
              {startContent}
            </div>
          )}
          
          <div className="flex-grow-1">
            <h6 className="text-muted mb-1 small">{name}</h6>
            <h3 className="mb-0 fw-bold text-dark">{value}</h3>
            {growth && (
              <div className="d-flex align-items-center mt-1">
                <span className="text-success small fw-bold me-2">{growth}</span>
                <span className="text-muted small">since last month</span>
              </div>
            )}
          </div>
          
          {endContent && (
            <div className="ms-auto">
              {endContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
