import React, { useState } from 'react';
import './BusinessBox.css';

function BusinessBox({ name, taxNumber, taxAmount, onClick, onPay }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const formattedTaxAmount =
    typeof taxAmount === 'number' ? `${taxAmount.toLocaleString()} EGP` : taxAmount || 'N/A';

  const isPayButtonEnabled = taxAmount && taxAmount !== 0 && typeof taxAmount === 'number';

  const handlePayClick = (e) => {
    e.stopPropagation();
    if (isPayButtonEnabled && onPay) {
      onPay();
    }
  };

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
      <div className="business-box-field">
        <span className="business-box-label">Tax Amount</span>
        <span className="business-box-value">{formattedTaxAmount}</span>
      </div>
      <button
        className={`business-pay-button ${isPayButtonEnabled ? 'enabled' : 'disabled'}`}
        onClick={handlePayClick}
        disabled={!isPayButtonEnabled}
      >
        Pay
      </button>
    </div>
  );
}

export default BusinessBox;

