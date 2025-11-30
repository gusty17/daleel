import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './home.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';
import BusinessBox from '../../components/box/BusinessBox';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showBusinessBoxes, setShowBusinessBoxes] = useState(false);
  const [showAddBusinessForm, setShowAddBusinessForm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    name: '',
    type: '',
    taxRegistrationNumber: '',
    revenueMin: '',
    revenueMax: ''
  });
  const [selectedInvoiceFiles, setSelectedInvoiceFiles] = useState([]);
  const [businessFormError, setBusinessFormError] = useState('');
  const [businessFormSuccess, setBusinessFormSuccess] = useState('');

  // Default user data
  const defaultUserData = {
    name: 'youssef',
    email: 'youssef@gmail.com',
    phoneNumber: '01094608093',
    nationalId: '30303030303030'
  };

  const defaultBusinesses = [];

  const normalizeBusinesses = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.businesses)) return payload.businesses;
    if (payload.data && Array.isArray(payload.data.businesses)) {
      return payload.data.businesses;
    }
    return [];
  };

  const handleProfileClick = async () => {
    if (showProfile) {
      // Keep profile visible and make sure businesses stay hidden
      setShowBusinessBoxes(false);
      setShowAddBusinessForm(false);
      return;
    }

    setIsProfileLoading(true);
    setShowProfile(true);
    setShowBusinessBoxes(false);
    setShowAddBusinessForm(false);

    try {
      // Fetch user data from backend
      const response = await axiosClient.get('/user/profile');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use default data if API fails
      setUserData(defaultUserData);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleBusinessClick = async () => {
    if (showBusinessBoxes) {
      // Keep business boxes visible and hide the profile panel
      setShowProfile(false);
      setShowAddBusinessForm(false);
      return;
    }

    setIsBusinessLoading(true);
    setShowBusinessBoxes(true);
    setShowProfile(false);
    setShowAddBusinessForm(false);

    try {
      const response = await axiosClient.get('/user/businesses');
      const data = normalizeBusinesses(response.data);
      setBusinesses(data.length ? data : []);
    } catch (error) {
      console.error('Error fetching business data:', error);
      setBusinesses(defaultBusinesses);
    } finally {
      setIsBusinessLoading(false);
    }
  };

  const handleAddBusinessClick = () => {
    // Show add business form, hide other panels
    setShowAddBusinessForm(true);
    setShowProfile(false);
    setShowBusinessBoxes(false);
    setBusinessFormError('');
    setBusinessFormSuccess('');
    setSelectedInvoiceFiles([]);
  };

  const handleBusinessFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInvoiceFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Validate that all files are PDFs
    const invalidFiles = newFiles.filter(file => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'));
    if (invalidFiles.length > 0) {
      setBusinessFormError('Please select only PDF files for invoices.');
      return;
    }
    
    // Append new files to existing files
    setSelectedInvoiceFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setBusinessFormError('');
  };

  const handleRemoveInvoiceFile = (indexToRemove) => {
    setSelectedInvoiceFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleBusinessFormSubmit = async (e) => {
    e.preventDefault();
    setBusinessFormError('');
    setBusinessFormSuccess('');

    const { name, type, taxRegistrationNumber, revenueMin, revenueMax } = businessForm;
    if (!name || !type || !taxRegistrationNumber || !revenueMin || !revenueMax) {
      setBusinessFormError('Please fill in all fields.');
      return;
    }

    if (isNaN(Number(revenueMin)) || isNaN(Number(revenueMax))) {
      setBusinessFormError('Revenue bracket must be numbers only.');
      return;
    }

    setIsSubmittingBusiness(true);
    try {
      const payload = {
        name,
        businessType: type,
        taxRegistrationNumber,
        revenueMin: Number(revenueMin),
        revenueMax: Number(revenueMax)
      };

      const response = await axiosClient.post('/user/businesses', payload);

      // Optimistically append new business if API returns it
      const created =
        response?.data?.business ||
        response?.data ||
        payload;

      // Set taxAmount to null for new business (unknown until invoices are added)
      const newBusiness = { ...created, taxAmount: null };

      // If invoices were selected, upload them
      if (selectedInvoiceFiles.length > 0) {
        try {
          const formData = new FormData();
          selectedInvoiceFiles.forEach((file) => {
            formData.append('invoices', file);
          });
          formData.append('businessId', newBusiness.id || newBusiness.taxRegistrationNumber);

          const invoiceResponse = await axiosClient.post('/business/invoices', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const calculatedTax = invoiceResponse?.data?.totalTaxAmount || invoiceResponse?.data?.taxAmount || null;
          newBusiness.taxAmount = calculatedTax;
        } catch (invoiceError) {
          console.error('Error uploading invoices:', invoiceError);
          // Business was created but invoice upload failed
          setBusinessFormSuccess('Business added successfully. However, invoice upload failed.');
        }
      }

      setBusinesses((prev) => [...prev, newBusiness]);
      setBusinessFormSuccess('Business added successfully' + (selectedInvoiceFiles.length > 0 ? ' and invoices uploaded.' : '.'));
      setBusinessForm({
        name: '',
        type: '',
        taxRegistrationNumber: '',
        revenueMin: '',
        revenueMax: ''
      });
      setSelectedInvoiceFiles([]);
    } catch (error) {
      console.error('Error adding business:', error);
      setBusinessFormError('Failed to add business. Please try again.');
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  // Use default data if no user data is loaded yet
  const displayData = userData || defaultUserData;
  // Show actual businesses, or empty array to show empty state
  const businessDisplay = businesses;

  // Handle navigation state from business_details page
  useEffect(() => {
    const state = location.state;
    if (state) {
      if (state.showProfile) {
        // Trigger profile click
        handleProfileClick();
      } else if (state.showBusinesses) {
        // Trigger business click
        handleBusinessClick();
      } else if (state.showAddBusiness) {
        // Trigger add business click
        handleAddBusinessClick();
      }
      
      // Clear the state to prevent re-triggering on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  return (
    <div className="home-container">
      <HomeLeft
        onProfileClick={handleProfileClick}
        onBusinessClick={handleBusinessClick}
        onAddBusinessClick={handleAddBusinessClick}
      />
      
      {/* Main content area */}
      <div className="home-main-content">
        {/* User Profile Info Box - displayed in center */}
        {showProfile && (
          <div className="profile-info-box-center">
            <div className="profile-info-header">
              <h3>User Information</h3>
              <button className="profile-close-btn" onClick={() => setShowProfile(false)}>×</button>
            </div>
            {isProfileLoading ? (
              <div className="profile-loading">Loading...</div>
            ) : (
              <div className="profile-info-content">
                <div className="profile-info-item">
                  <span className="profile-info-label">Name:</span>
                  <span className="profile-info-value">{displayData.name}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Email:</span>
                  <span className="profile-info-value">{displayData.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Phone Number:</span>
                  <span className="profile-info-value">{displayData.phoneNumber}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">National ID:</span>
                  <span className="profile-info-value">{displayData.nationalId}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {showBusinessBoxes && (
          <div className="business-box-wrapper">
            <div className="profile-info-header">
              <h3>User Businesses</h3>
              <button className="profile-close-btn" onClick={() => setShowBusinessBoxes(false)}>×</button>
            </div>
            {isBusinessLoading ? (
              <div className="business-loading">Loading businesses...</div>
            ) : (
              <div className="business-box-grid">
                {businessDisplay.length === 0 ? (
                  <div className="business-box empty-business-box">
                    <div className="business-box-field">
                      <span className="business-box-label">Business Name</span>
                      <span className="business-box-value">No businesses yet</span>
                    </div>
                    <div className="business-box-field">
                      <span className="business-box-label">Tax Number</span>
                      <span className="business-box-value">-</span>
                    </div>
                    <div className="business-box-field">
                      <span className="business-box-label">Tax Amount</span>
                      <span className="business-box-value">-</span>
                    </div>
                  </div>
                ) : (
                  businessDisplay.map((business, index) => (
                    <BusinessBox
                      key={business.id || business.taxNumber || index}
                      name={business.name}
                      taxNumber={business.taxNumber}
                      taxAmount={business.taxAmount}
                      onClick={() => navigate('/business_details', { state: { business } })}
                    />
                  ))
                )}
                <div 
                  className="business-box add-business-box" 
                  onClick={handleAddBusinessClick}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="add-business-content">
                    <div className="add-business-icon">➕</div>
                    <span className="add-business-text">Add Business</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showAddBusinessForm && (
          <div className="add-business-form-wrapper">
            <div className="profile-info-header">
              <h3>Add Business</h3>
            </div>
            <form className="add-business-form" onSubmit={handleBusinessFormSubmit}>
              <div className="form-row">
                <label className="form-label" htmlFor="business-name">
                  Business Name
                </label>
                <input
                  id="business-name"
                  name="name"
                  className="form-input"
                  type="text"
                  value={businessForm.name}
                  onChange={handleBusinessFormChange}
                  placeholder="Enter business name"
                />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="business-type">
                  Business Type
                </label>
                <input
                  id="business-type"
                  name="type"
                  className="form-input"
                  type="text"
                  value={businessForm.type}
                  onChange={handleBusinessFormChange}
                  placeholder="e.g. Retail, Services"
                />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="tax-registration-number">
                  Tax Registration Number
                </label>
                <input
                  id="tax-registration-number"
                  name="taxRegistrationNumber"
                  className="form-input"
                  type="text"
                  value={businessForm.taxRegistrationNumber}
                  onChange={handleBusinessFormChange}
                  placeholder="Enter tax registration number"
                />
              </div>
              <div className="form-row">
                <label className="form-label">
                  Revenue Bracket
                </label>
                <div className="form-row-inline">
                  <input
                    id="revenue-min"
                    name="revenueMin"
                    className="form-input form-input-half"
                    type="number"
                    min="0"
                    value={businessForm.revenueMin}
                    onChange={handleBusinessFormChange}
                    placeholder="Min"
                  />
                  <input
                    id="revenue-max"
                    name="revenueMax"
                    className="form-input form-input-half"
                    type="number"
                    min="0"
                    value={businessForm.revenueMax}
                    onChange={handleBusinessFormChange}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Invoice Upload Section */}
              <div className="form-row">
                <label className="form-label" htmlFor="business-invoices">
                  Upload Invoice PDFs (Optional)
                </label>
                <label htmlFor="business-invoices" className="file-upload-label">
                  <div className="file-upload-area-small">
                    <span className="file-upload-icon-small">📄</span>
                    <span className="file-upload-text-small">
                      {selectedInvoiceFiles.length > 0
                        ? `${selectedInvoiceFiles.length} PDF file(s) selected`
                        : 'Click to select PDF files'}
                    </span>
                    <input
                      id="business-invoices"
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleInvoiceFileChange}
                      className="file-input"
                    />
                  </div>
                </label>
                {selectedInvoiceFiles.length > 0 && (
                  <div className="selected-files-list-small">
                    {selectedInvoiceFiles.map((file, index) => (
                      <div key={index} className="selected-file-item-small">
                        <div className="file-info-small">
                          <span className="file-name-small">{file.name}</span>
                          <span className="file-size-small">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          className="file-remove-btn-small"
                          onClick={() => handleRemoveInvoiceFile(index)}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {businessFormError && (
                <div className="form-message form-error">{businessFormError}</div>
              )}
              {businessFormSuccess && (
                <div className="form-message form-success">{businessFormSuccess}</div>
              )}

              <button
                type="submit"
                className="form-submit-btn"
                disabled={isSubmittingBusiness}
              >
                {isSubmittingBusiness ? 'Saving...' : 'Save Business'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

