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
    invoiceNumber: '',
    issuerName: '',
    receiverName: '',
    totalAmount: ''
  });
  const [invoices, setInvoices] = useState([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
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
  // Fetch invoices function (extracted so it can be reused after adding an invoice)
  const fetchInvoices = async () => {
    if (!business.id) {
      setIsLoadingInvoices(false);
      return;
    }

    setIsLoadingInvoices(true);
    try {
      const response = await axiosClient.post('/invoices/business-invoices', {
        businessId: business.id
      });

      console.log('Invoices API response:', response.data);

      // Handle different possible response structures
      const invoiceData = Array.isArray(response.data)
        ? response.data
        : response.data.invoices || [];

      setInvoices(invoiceData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      // Always clear loading flag, regardless of mount status
      setIsLoadingInvoices(false);
    }
  };

  // Fetch invoices when component mounts or when business.id changes
  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id]);

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

    const { invoiceNumber, issuerName, receiverName, totalAmount } = invoiceForm;

    // Validation
    if (!invoiceNumber || !issuerName || !receiverName || !totalAmount) {
      setError('Please fill in all invoice fields.');
      return;
    }

    if (isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      setError('Total amount must be a valid number greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a UUID for the invoice (safe fallback if crypto.randomUUID is unavailable)
      let invoiceUuid;
      try {
        invoiceUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `inv-${Date.now()}`;
      } catch (uuidErr) {
        invoiceUuid = `inv-${Date.now()}`;
      }

      const payload = {
        businessId: business.id,
        invoiceUuid,
        invoiceNumber,
        issuerName,
        receiverName,
        totalAmount: Number(totalAmount)
      };

      const response = await axiosClient.post('/invoices/add', payload);

      // Prefer backend response, otherwise use payload
      const created = response?.data && Object.keys(response.data).length ? response.data : payload;

      // Update UI: either re-fetch from server or optimistically append
      // Re-fetch to guarantee consistency with server-side generated fields
      await fetchInvoices();

      if (isMounted) {
        setSuccess('Invoice added successfully.');
        setInvoiceForm({
          invoiceNumber: '',
          issuerName: '',
          receiverName: '',
          totalAmount: ''
        });
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
      if (isMounted) {
        setError(error.response?.data?.message || 'Failed to add invoice. Please try again.');
      }
    } finally {
      // always clear submitting flag so the button stops showing "Processing..."
      setIsSubmitting(false);
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

  const handleBackClick = () => {
    // Navigate back to home page with businesses showing
    navigate('/home', { state: { showBusinesses: true } });
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
        {/* Back Button */}
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Businesses
        </button>

        {/* Two Column Layout */}
        <div className="content-wrapper">
          {/* Left Column - Business Info and Add Invoice */}
          <div className="left-column">
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
              <label className="form-label" htmlFor="invoice-number">
                Invoice Number
              </label>
              <input
                id="invoice-number"
                name="invoiceNumber"
                className="form-input"
                type="text"
                value={invoiceForm.invoiceNumber}
                onChange={handleInvoiceFormChange}
                placeholder="e.g. INV-001"
                required
              />
            </div>

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
                required
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
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="total-amount">
                Total Amount
              </label>
              <input
                id="total-amount"
                name="totalAmount"
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={invoiceForm.totalAmount}
                onChange={handleInvoiceFormChange}
                placeholder="Enter total amount"
                required
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

          {/* Right Column - Invoices Table */}
          <div className="right-column">
            {/* Invoices List */}
            <div className="invoices-list-box">
          <div className="business-info-header">
            <h3>Invoices</h3>
          </div>
          {isLoadingInvoices ? (
            <div className="invoices-loading">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="no-invoices">No invoices found for this business.</div>
          ) : (
            <div className="invoices-table-wrapper">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Issuer</th>
                    <th>Receiver</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.invoiceUuid || invoice.id || index}>
                      <td>{invoice.invoiceNumber || 'N/A'}</td>
                      <td>{invoice.issuerName || 'N/A'}</td>
                      <td>{invoice.receiverName || 'N/A'}</td>
                      <td>
                        {invoice.totalAmount 
                          ? `${Number(invoice.totalAmount).toLocaleString()} EGP` 
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetail;
