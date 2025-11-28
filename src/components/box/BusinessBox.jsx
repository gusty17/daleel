import React from 'react';
import './BusinessBox.css';

function BusinessBox({ name, taxNumber, taxAmount }) {
  const formattedTaxAmount =
    typeof taxAmount === 'number' ? `${taxAmount.toLocaleString()} EGP` : taxAmount || 'N/A';

  return (
    <div className="business-box">
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
    </div>
  );
}

export default BusinessBox;

