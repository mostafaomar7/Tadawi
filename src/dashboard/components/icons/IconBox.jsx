import React from 'react';

export default function IconBox({ children, bg, className = '', style = {} }) {
  return (
    <div 
      className={`d-flex align-items-center justify-content-center rounded-3 ${className}`}
      style={{
        width: '56px',
        height: '56px',
        background: bg || 'linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
