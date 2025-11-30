import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './checkout.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const business = location.state?.business || {};
  
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: '',
    phone: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      const cleanedValue = value.replace(/\s/g, '').slice(0, 16);
      const formattedValue = cleanedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      let cleanedValue = value.replace(/\D/g, '').slice(0, 4);
      if (cleanedValue.length >= 2) {
        cleanedValue = cleanedValue.slice(0, 2) + '/' + cleanedValue.slice(2);
      }
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
      return;
    }

    // Format CVV (numbers only)
    if (name === 'cvv') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 4) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.cardName.trim()) {
      setErrorMessage('Cardholder name is required');
      return false;
    }

    const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length !== 16 || !/^\d+$/.test(cleanedCardNumber)) {
      setErrorMessage('Card number must be 16 digits');
      return false;
    }

    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      setErrorMessage('Expiry date must be in MM/YY format');
      return false;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      setErrorMessage('CVV must be 3-4 digits');
      return false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Valid email is required');
      return false;
    }

    if (!formData.phone || !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      setErrorMessage('Valid phone number is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare payload to send to backend
      const payload = {
        businessId: business.id || business.taxNumber,
        businessName: business.name,
        taxNumber: business.taxNumber,
        taxAmount: business.taxAmount,
        cardholderName: formData.cardName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        email: formData.email,
        phone: formData.phone
      };

      // Send payment data to backend
      const response = await axiosClient.post('/checkout/process-payment', payload);

      if (response.status === 200 || response.data.success) {
        setSuccessMessage('Payment processed successfully! Redirecting...');
        
        setTimeout(() => {
          navigate('/home', { state: { showBusinesses: true } });
        }, 1500);
      } else {
        setErrorMessage(response.data.message || 'Payment processing failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogoClick = () => {
    navigate('/home');
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

  return (
    <div className="checkout-container">
      <HomeLeft 
        onLogoClick={handleLogoClick}
        onProfileClick={handleProfileClick}
        onBusinessClick={handleBusinessClick}
        onAddBusinessClick={handleAddBusinessClick}
      />
      
      <div className="checkout-content">
        <div className="checkout-wrapper">
          <div className="checkout-header">
            <h2>Payment Checkout</h2>
            <button className="checkout-back-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>

          {business && business.name && (
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span className="summary-label">Business Name:</span>
                <span className="summary-value">{business.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tax Number:</span>
                <span className="summary-value">{business.taxNumber || 'N/A'}</span>
              </div>
              <div className="summary-item total">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value">{business.taxAmount?.toLocaleString()} EGP</span>
              </div>
            </div>
          )}

          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Card Information</h3>
              
              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  disabled={isProcessing}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    disabled={isProcessing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Billing Information</h3>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="01234567890"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="form-message error-message">{errorMessage}</div>
            )}

            {successMessage && (
              <div className="form-message success-message">{successMessage}</div>
            )}

            <button
              type="submit"
              className="pay-submit-btn"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${business.taxAmount?.toLocaleString()} EGP`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
