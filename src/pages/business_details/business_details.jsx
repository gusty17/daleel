import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './business_details.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';

function BusinessDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const business = location.state?.business || {
    id: 'default',
    name: 'Unknown Business',
    taxNumber: 'N/A',
    taxAmount: 0
  };

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalTaxAmount, setTotalTaxAmount] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate that all files are PDFs
    const invalidFiles = files.filter(file => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'));
    if (invalidFiles.length > 0) {
      setError('Please select only PDF files.');
      setSelectedFiles([]);
      return;
    }
    
    setSelectedFiles(files);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedFiles.length === 0) {
      setError('Please select at least one invoice file.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('invoices', file);
      });
      formData.append('businessId', business.id || business.taxNumber);

      const response = await axiosClient.post('/business/invoices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const calculatedTax = response?.data?.totalTaxAmount || response?.data?.taxAmount || 0;
      setTotalTaxAmount(calculatedTax);
      setSuccess('Invoices uploaded and tax calculated successfully.');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading invoices:', error);
      setError(error.response?.data?.message || 'Failed to upload invoices. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileClick = () => {
    // Navigate back to home with profile view
    navigate('/home', { state: { showProfile: true } });
  };

  const handleBusinessClick = () => {
    // Navigate back to home with business view
    navigate('/home', { state: { showBusinesses: true } });
  };

  const handleAddBusinessClick = () => {
    // Navigate back to home with add business form
    navigate('/home', { state: { showAddBusiness: true } });
  };

  return (
    <div className="business-details-container">
      <HomeLeft
        onProfileClick={handleProfileClick}
        onBusinessClick={handleBusinessClick}
        onAddBusinessClick={handleAddBusinessClick}
      />

      <div className="business-details-main-content">
        {/* Business Info Box */}
        <div className="business-info-box">
          <div className="profile-info-header">
            <h3>Business Information</h3>
          </div>
          <div className="business-info-content">
            <div className="business-info-item">
              <span className="business-info-label">Business Name</span>
              <span className="business-info-value">{business.name}</span>
            </div>
            <div className="business-info-item">
              <span className="business-info-label">Tax Number</span>
              <span className="business-info-value">{business.taxNumber}</span>
            </div>
          </div>
        </div>

        {/* Invoice Upload Box */}
        <div className="invoice-upload-box">
          <div className="profile-info-header">
            <h3>Upload Invoices</h3>
          </div>
          <form className="invoice-upload-form" onSubmit={handleSubmit}>
            <div className="file-upload-section">
              <label htmlFor="invoice-files" className="file-upload-label">
                <div className="file-upload-area">
                  <span className="file-upload-icon">📄</span>
                  <span className="file-upload-text">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} PDF file(s) selected`
                      : 'Click to select PDF invoice files'}
                  </span>
                  <input
                    id="invoice-files"
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </div>
              </label>
              {selectedFiles.length > 0 && (
                <div className="selected-files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="selected-file-item">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="form-message form-error">{error}</div>}
            {success && <div className="form-message form-success">{success}</div>}

            <button
              type="submit"
              className="invoice-submit-btn"
              disabled={isSubmitting || selectedFiles.length === 0}
            >
              {isSubmitting ? 'Processing...' : 'Submit Invoices'}
            </button>
          </form>
        </div>

        {/* Total Tax Amount Display */}
        {totalTaxAmount !== null && (
          <div className="tax-amount-box">
            <div className="profile-info-header">
              <h3>Tax Calculation Result</h3>
            </div>
            <div className="tax-amount-content">
              <div className="tax-amount-item">
                <span className="tax-amount-label">Total Tax Amount</span>
                <span className="tax-amount-value">
                  {typeof totalTaxAmount === 'number'
                    ? `${totalTaxAmount.toLocaleString()} EGP`
                    : totalTaxAmount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessDetails;

