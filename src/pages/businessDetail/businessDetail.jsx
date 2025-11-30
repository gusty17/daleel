import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './businessDetail.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';

function BusinessDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const business = location.state?.business || {
    id: 'default',
    name: 'Unknown Business',
    taxNumber: 'N/A',
    taxAmount: null
  };

  const [invoiceForm, setInvoiceForm] = useState({
    issuerName: '',
    receiverName: '',
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxAmount, setTaxAmount] = useState(business.taxAmount || null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMounted, setIsMounted] = useState(true);

  // Track if component is mounted to prevent state updates after unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { issuerName, receiverName, amount } = invoiceForm;

    // Validation
    if (!issuerName || !receiverName || !amount) {
      setError('Please fill in all invoice fields.');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Amount must be a valid number greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        businessId: business.id || business.taxNumber,
        issuerName,
        receiverName,
        amount: Number(amount)
      };

      const response = await axiosClient.post('/business/invoice', payload);

      const calculatedTax = response?.data?.taxAmount || response?.data?.calculatedTax || null;
      
      // Only update state if component is still mounted
      if (isMounted) {
        setTaxAmount(calculatedTax);
        setSuccess('Invoice added successfully and tax calculated.');
        setInvoiceForm({
          issuerName: '',
          receiverName: '',
          amount: ''
        });
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
      if (isMounted) {
        setError(error.response?.data?.message || 'Failed to add invoice. Please try again.');
      }
    } finally {
      if (isMounted) {
        setIsSubmitting(false);
      }
    }
  };

  const handleProfileClick = () => {
    navigate('/home', { state: { showProfile: true } });
  };

  const handleBusinessClick = () => {
    navigate('/home', { state: { showBusinesses: true } });
  };

  const handleAddBusinessClick = () => {
    navigate('/home', { state: { showAddBusiness: true } });
  };

  const handleLogoClick = () => {
    // Navigate to home without showing any specific panel
    navigate('/home');
  };

  // Handle navigation state from home page
  useEffect(() => {
    // This effect runs when the component mounts
    // The navigation state is handled by the home page's useEffect
  }, []);

  return (
    <div className="business-detail-container">
      <HomeLeft
        onProfileClick={handleProfileClick}
        onBusinessClick={handleBusinessClick}
        onAddBusinessClick={handleAddBusinessClick}
        onLogoClick={handleLogoClick}
      />

      <div className="business-detail-main-content">
        {/* Business Info Box */}
        <div className="business-info-box">
          <div className="business-info-header">
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
            <div className="business-info-item">
              <span className="business-info-label">Tax Amount</span>
              <span className="business-info-value">
                {taxAmount !== null && typeof taxAmount === 'number'
                  ? `${taxAmount.toLocaleString()} EGP`
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Add Invoice Form */}
        <div className="invoice-form-box">
          <div className="business-info-header">
            <h3>Add Invoice</h3>
          </div>
          <form className="invoice-form" onSubmit={handleAddInvoice}>
            <div className="form-row">
              <label className="form-label" htmlFor="issuer-name">
                Issuer Name
              </label>
              <input
                id="issuer-name"
                name="issuerName"
                className="form-input"
                type="text"
                value={invoiceForm.issuerName}
                onChange={handleInvoiceFormChange}
                placeholder="Enter issuer name"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="receiver-name">
                Receiver Name
              </label>
              <input
                id="receiver-name"
                name="receiverName"
                className="form-input"
                type="text"
                value={invoiceForm.receiverName}
                onChange={handleInvoiceFormChange}
                placeholder="Enter receiver name"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={invoiceForm.amount}
                onChange={handleInvoiceFormChange}
                placeholder="Enter amount"
              />
            </div>

            {error && <div className="form-message form-error">{error}</div>}
            {success && <div className="form-message form-success">{success}</div>}

            <button
              type="submit"
              className="invoice-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Add Invoice'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetail;
