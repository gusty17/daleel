import React, { useState } from 'react';
import './BusinessBox.css';

function BusinessBox({ name, taxNumber, taxAmount, onClick, onPay }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`business-box ${isHovered ? 'hovered' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="business-box-field">
        <span className="business-box-label">Business Name</span>
        <span className="business-box-value">{name || 'N/A'}</span>
      </div>
      <div className="business-box-field">
        <span className="business-box-label">Tax Number</span>
        <span className="business-box-value">{taxNumber || 'N/A'}</span>
      </div>
    </div>
  );
}

export default BusinessBox;

