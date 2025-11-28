import React, { useState } from 'react';
import './home.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';
import BusinessBox from '../../components/box/BusinessBox';

function Home() {
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
  const [businessFormError, setBusinessFormError] = useState('');
  const [businessFormSuccess, setBusinessFormSuccess] = useState('');

  // Default user data
  const defaultUserData = {
    name: 'youssef',
    email: 'youssef@gmail.com',
    phoneNumber: '01094608093',
    nationalId: '30303030303030'
  };

  const defaultBusinesses = [
    {
      id: 'demo-1',
      name: 'business1',
      taxNumber: 'TN-203003',
      taxAmount: 1500
    },
    {
      id: 'demo-2',
      name: 'business2',
      taxNumber: 'TN-203663',
      taxAmount: 1500
    },
    {
      id: 'demo-3',
      name: 'business3',
      taxNumber: 'TN-403090',
      taxAmount: 2240
    }
  ];

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
      setBusinesses(data.length ? data : defaultBusinesses);
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
  };

  const handleBusinessFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => ({
      ...prev,
      [name]: value
    }));
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

      setBusinesses((prev) => [...prev, created]);
      setBusinessFormSuccess('Business added successfully.');
      setBusinessForm({
        name: '',
        type: '',
        taxRegistrationNumber: '',
        revenueMin: '',
        revenueMax: ''
      });
    } catch (error) {
      console.error('Error adding business:', error);
      setBusinessFormError('Failed to add business. Please try again.');
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  // Use default data if no user data is loaded yet
  const displayData = userData || defaultUserData;
  const businessDisplay = businesses.length ? businesses : defaultBusinesses;

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
                {businessDisplay.map((business, index) => (
                  <BusinessBox
                    key={business.id || business.taxNumber || index}
                    name={business.name}
                    taxNumber={business.taxNumber}
                    taxAmount={business.taxAmount}
                  />
                ))}
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

