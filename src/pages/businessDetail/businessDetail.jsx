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
    totalAmount: '',
    invoiceDate: ''
  });
  const [invoices, setInvoices] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quarterlyTaxes, setQuarterlyTaxes] = useState([]);
  const [showTaxPopup, setShowTaxPopup] = useState(false);
  const [selectedQuarterForTax, setSelectedQuarterForTax] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMounted, setIsMounted] = useState(true);
  const [rightView, setRightView] = useState('add-invoice'); // 'add-invoice', 'q1', 'q2', 'q3', 'q4'
  

  // Track if component is mounted to prevent state updates after unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Fetch tax calculation for all quarters
  const fetchTaxCalculation = async () => {
    if (!business.id) return;

    try {
      const currentYear = new Date().getFullYear();
      console.log('Fetching tax calculation for:', { businessId: business.id, year: currentYear });
      
      const response = await axiosClient.post('/business/calculate-tax', {
        businessId: business.id,
        year: currentYear
      });

      console.log('Tax Calculation API response:', response.data);
      console.log('quarterlyTaxes array:', response.data.quarterlyTaxes);
      console.log('Total tax for year:', response.data.totalTaxForYear);
      
      setQuarterlyTaxes(response.data.quarterlyTaxes || []);
    } catch (error) {
      console.error('Error fetching tax calculation:', error);
      console.error('Error details:', error.response?.data);
      setQuarterlyTaxes([]);
    }
  };

  // Fetch invoices function (extracted so it can be reused after adding an invoice)
  const fetchInvoices = async () => {
    if (!business.id) {
      setIsLoadingInvoices(false);
      return;
    }

    setIsLoadingInvoices(true);
    try {
      const currentYear = new Date().getFullYear();
      
      // Try the quarterly endpoint first
      try {
        const response = await axiosClient.post('/invoices/quarterly-invoices', {
          businessId: business.id,
          year: currentYear
        });

        console.log('Quarterly Invoices API response:', response.data);
        console.log('Sample invoice data:', response.data.quarterlyData?.[0]?.invoices?.[0]);

        // Store quarterly data and grand total
        setQuarterlyData(response.data.quarterlyData || []);
        setGrandTotal(response.data.grandTotal || 0);
        
        // Also keep all invoices in a flat array for compatibility
        const allInvoices = [];
        if (response.data.quarterlyData) {
          response.data.quarterlyData.forEach(qData => {
            if (qData.invoices) {
              allInvoices.push(...qData.invoices);
            }
          });
        }
        setInvoices(allInvoices);
      } catch (quarterlyError) {
        // If quarterly endpoint fails (404), fallback to regular endpoint
        console.warn('Quarterly endpoint not available, falling back to business-invoices:', quarterlyError.message);
        
        const response = await axiosClient.post('/invoices/business-invoices', {
          businessId: business.id
        });

        console.log('Invoices API response (fallback):', response.data);

        // Handle different possible response structures
        const invoiceData = Array.isArray(response.data)
          ? response.data
          : response.data.invoices || [];

        setInvoices(invoiceData);
        
        // Manually organize into quarters for compatibility
        const quarters = [
          { quarter: 1, invoices: [], totalAmount: 0 },
          { quarter: 2, invoices: [], totalAmount: 0 },
          { quarter: 3, invoices: [], totalAmount: 0 },
          { quarter: 4, invoices: [], totalAmount: 0 }
        ];
        
        invoiceData.forEach(invoice => {
          const date = new Date(invoice.invoiceDate || invoice.timestamp || invoice.createdAt);
          const month = date.getMonth() + 1;
          let quarterIndex = 0;
          if (month >= 1 && month <= 3) quarterIndex = 0;
          else if (month >= 4 && month <= 6) quarterIndex = 1;
          else if (month >= 7 && month <= 9) quarterIndex = 2;
          else quarterIndex = 3;
          
          quarters[quarterIndex].invoices.push(invoice);
          quarters[quarterIndex].totalAmount += Number(invoice.totalAmount || 0);
        });
        
        setQuarterlyData(quarters);
        
        const total = quarters.reduce((sum, q) => sum + q.totalAmount, 0);
        setGrandTotal(total);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
      setQuarterlyData([]);
      setGrandTotal(0);
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

    const { invoiceNumber, issuerName, receiverName, totalAmount, invoiceDate } = invoiceForm;

    // Validation
    if (!invoiceNumber || !issuerName || !receiverName || !totalAmount || !invoiceDate) {
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
        totalAmount: Number(totalAmount),
        invoiceDate: new Date(invoiceDate).toISOString()
      };

      const response = await axiosClient.post('/invoices/add', payload);

      // Prefer backend response, otherwise use payload
      const created = response?.data && Object.keys(response.data).length ? response.data : payload;

      // Update UI: either re-fetch from server or optimistically append
      // Re-fetch to guarantee consistency with server-side generated fields
      await fetchInvoices();
      await fetchTaxCalculation(); // Update tax calculation after adding invoice

      if (isMounted) {
        setSuccess('Invoice added successfully.');
        setInvoiceForm({
          invoiceNumber: '',
          issuerName: '',
          receiverName: '',
          totalAmount: '',
          invoiceDate: ''
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

  const getQuarterFromDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 1-12
    if (month >= 1 && month <= 3) return 'q1';
    if (month >= 4 && month <= 6) return 'q2';
    if (month >= 7 && month <= 9) return 'q3';
    return 'q4';
  };

  const getInvoicesByQuarter = (quarter) => {
    const quarterNum = parseInt(quarter.replace('q', ''));
    const qData = quarterlyData.find(q => q.quarter === quarterNum);
    return qData ? qData.invoices : [];
  };

  const getQuarterTotal = (quarter) => {
    const quarterNum = parseInt(quarter.replace('q', ''));
    const qData = quarterlyData.find(q => q.quarter === quarterNum);
    return qData ? qData.totalAmount : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getQuarterCount = (quarter) => {
    const quarterNum = parseInt(quarter.replace('q', ''));
    const qData = quarterlyData.find(q => q.quarter === quarterNum);
    return qData ? qData.invoices.length : 0;
  };

  const getQuarterRevenue = (quarter) => {
    const quarterNum = parseInt(quarter.replace('q', ''));
    const taxData = quarterlyTaxes.find(qt => qt.quarter === quarterNum);
    return taxData ? taxData.totalRevenue : 0;
  };

  const getQuarterTax = (quarter) => {
    const quarterNum = parseInt(quarter.replace('q', ''));
    console.log('Getting tax for quarter:', quarterNum);
    console.log('Available quarterlyTaxes:', quarterlyTaxes);
    
    const taxData = quarterlyTaxes.find(qt => qt.quarter === quarterNum);
    console.log('Found tax data for quarter', quarterNum, ':', taxData);
    
    return taxData ? taxData.taxAmount : 0;
  };

  const handleTaxClick = (quarter) => {
    setSelectedQuarterForTax(quarter);
    setShowTaxPopup(true);
  };

  const closeTaxPopup = () => {
    setShowTaxPopup(false);
    setSelectedQuarterForTax(null);
  };

  const handleTaxAgreement = () => {
    // Navigate to checkout with tax payment data
    const quarterNum = parseInt(selectedQuarterForTax.replace('q', ''));
    const taxAmount = getQuarterTax(selectedQuarterForTax);
    const revenue = getQuarterRevenue(selectedQuarterForTax);
    
    navigate('/checkout', {
      state: {
        taxPayment: {
          businessId: business.id,
          businessName: business.name,
          quarter: quarterNum,
          quarterLabel: selectedQuarterForTax === 'q1' ? 'Q1 (Jan - Mar)' :
                        selectedQuarterForTax === 'q2' ? 'Q2 (Apr - Jun)' :
                        selectedQuarterForTax === 'q3' ? 'Q3 (Jul - Sep)' : 'Q4 (Oct - Dec)',
          taxAmount: taxAmount,
          revenue: revenue,
          serviceFee: taxAmount * 0.05,
          totalAmount: taxAmount + (taxAmount * 0.05)
        }
      }
    });
  };

  // Fetch invoices and tax calculation on mount
  useEffect(() => {
    fetchInvoices();
    fetchTaxCalculation();
  }, [business.id]);

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
          {/* Left Column - Business Info and Action Buttons */}
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
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="action-buttons-card">
              <div className="business-info-header">
                <h3>Actions</h3>
              </div>
              <div className="action-buttons-content">
                <button 
                  className={`action-btn ${rightView === 'add-invoice' ? 'active' : ''}`}
                  onClick={() => setRightView('add-invoice')}
                >
                  ➕ Add Invoice
                </button>
                <div className="quarter-buttons-label">View Invoices by Quarter:</div>
                <div className="quarter-buttons-grid">
                  <button 
                    className={`quarter-btn ${rightView === 'q1' ? 'active' : ''}`}
                    onClick={() => setRightView('q1')}
                  >
                    Q1<span className="quarter-count">({getQuarterCount('q1')})</span>
                  </button>
                  <button 
                    className={`quarter-btn ${rightView === 'q2' ? 'active' : ''}`}
                    onClick={() => setRightView('q2')}
                  >
                    Q2<span className="quarter-count">({getQuarterCount('q2')})</span>
                  </button>
                  <button 
                    className={`quarter-btn ${rightView === 'q3' ? 'active' : ''}`}
                    onClick={() => setRightView('q3')}
                  >
                    Q3<span className="quarter-count">({getQuarterCount('q3')})</span>
                  </button>
                  <button 
                    className={`quarter-btn ${rightView === 'q4' ? 'active' : ''}`}
                    onClick={() => setRightView('q4')}
                  >
                    Q4<span className="quarter-count">({getQuarterCount('q4')})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dynamic Content */}
          <div className="right-column">
            {rightView === 'add-invoice' ? (
              /* Add Invoice Form */
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
              <label className="form-label" htmlFor="invoice-date">
                Invoice Date
              </label>
              <input
                id="invoice-date"
                name="invoiceDate"
                className="form-input"
                type="date"
                value={invoiceForm.invoiceDate}
                onChange={handleInvoiceFormChange}
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
            ) : (
              /* Quarter Invoice Tables */
              <div className="invoices-list-box">
                <div className="business-info-header">
                  <h3>
                    {rightView === 'q1' && 'Q1 Invoices (Jan - Mar)'}
                    {rightView === 'q2' && 'Q2 Invoices (Apr - Jun)'}
                    {rightView === 'q3' && 'Q3 Invoices (Jul - Sep)'}
                    {rightView === 'q4' && 'Q4 Invoices (Oct - Dec)'}
                  </h3>
                </div>
                {isLoadingInvoices ? (
                  <div className="invoices-loading">Loading invoices...</div>
                ) : getInvoicesByQuarter(rightView).length === 0 ? (
                  <div className="no-invoices">No invoices found for this quarter.</div>
                ) : (
                  <div className="invoices-table-wrapper">
                    <table className="invoices-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Invoice #</th>
                          <th>Issuer</th>
                          <th>Receiver</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getInvoicesByQuarter(rightView).map((invoice, index) => {
                          console.log('Invoice being rendered:', invoice);
                          return (
                            <tr key={invoice.invoiceUuid || invoice.id || index}>
                              <td>{formatDate(invoice.invoiceDate || invoice.timestamp || invoice.createdAt)}</td>
                              <td>{invoice.invoiceNumber || 'N/A'}</td>
                              <td>{invoice.issuerName || 'N/A'}</td>
                              <td>{invoice.receiverName || 'N/A'}</td>
                              <td>
                                {invoice.totalAmount 
                                  ? `${Number(invoice.totalAmount).toLocaleString()} EGP` 
                                  : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td colSpan="4" className="total-label">Total Revenue</td>
                          <td className="total-amount">
                            {getQuarterRevenue(rightView).toLocaleString()} EGP
                          </td>
                        </tr>
                        <tr className="tax-row">
                          <td colSpan="4" className="tax-label">Tax Amount</td>
                          <td 
                            className="tax-amount blurred-tax" 
                            onClick={() => handleTaxClick(rightView)}
                            title="Click to view tax amount"
                          >
                            {getQuarterTax(rightView).toLocaleString()} EGP
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tax Amount Popup */}
      {showTaxPopup && (
        <div className="tax-popup-overlay" onClick={closeTaxPopup}>
          <div className="tax-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="tax-popup-header">
              <h3>Tax Calculation Service</h3>
              <button className="tax-popup-close" onClick={closeTaxPopup}>×</button>
            </div>
            <div className="tax-popup-body">
              <p className="tax-popup-message">
                To view your tax calculation details and proceed with payment, you agree to pay a service fee of <strong>5%</strong> of the total tax amount. 
                This fee enables our advanced tax calculation services and ensures accurate compliance with Egyptian tax regulations.
              </p>
              <p className="tax-popup-disclaimer">
                By clicking "I Agree", you authorize Daleel to proceed to payment where you'll see the complete breakdown of charges.
              </p>
            </div>
            <button className="tax-popup-exit" onClick={handleTaxAgreement}>
              I Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessDetail;
