import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './home.css';
import '../membership/membership.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';
import BusinessBox from '../../components/box/BusinessBox';
import { getUserIdFromToken } from '../../utils/tokenUtils';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showBusinessBoxes, setShowBusinessBoxes] = useState(false);
  const [showAddBusinessForm, setShowAddBusinessForm] = useState(false);
  const [showAbout, setShowAbout] = useState(true);
  const [showMembership, setShowMembership] = useState(false);
  const [activeSection, setActiveSection] = useState('about'); // 'about', 'profile', 'business', 'membership', or null
  const [userData, setUserData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    name: '',
    taxRegistrationNumber: ''
  });
  const [businessFormError, setBusinessFormError] = useState('');
  const [businessFormSuccess, setBusinessFormSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [businessError, setBusinessError] = useState('');

  const normalizeBusinesses = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.businesses)) return payload.businesses;
    if (payload.data && Array.isArray(payload.data.businesses)) {
      return payload.data.businesses;
    }
    return [];
  };

  const calculateBirthDateFromNationalId = (nationalId) => {
    if (!nationalId || nationalId.length < 7) return 'N/A';
    
    const yearStr = nationalId.substring(1, 3);
    const monthStr = nationalId.substring(3, 5);
    const dayStr = nationalId.substring(5, 7);
    
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return 'N/A';
    }
    
    // Determine century: 0-29 is 2000s, 30-99 is 1900s
    const fullYear = year <= 29 ? 2000 + year : 1900 + year;
    
    const date = new Date(fullYear, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleProfileClick = async () => {
    if (showProfile) {
      // Keep profile visible
      return;
    }

    setIsProfileLoading(true);
    setShowProfile(true);
    setShowBusinessBoxes(false);
    setShowAddBusinessForm(false);
    setShowAbout(false);
    setShowMembership(false);
    setActiveSection('profile');
    setProfileError('');
    setUserData(null);

    try {
      // Get user ID from token
      const userId = getUserIdFromToken();
      
      if (!userId) {
        console.error('No user ID found in token');
        setProfileError('User not authenticated. Please log in again.');
        return;
      }

      // Fetch user data from backend with user ID
      const response = await axiosClient.post('/users/user', { id: userId });
      const apiData = response.data;

      console.log('Fetched user data:', apiData);
      
      // Map the API response to our display format
      const mappedData = {
        name: apiData.fullName || apiData.name || 'N/A',
        email: apiData.email || 'N/A',
        phoneNumber: apiData.mobile || apiData.phoneNumber || 'N/A',
        nationalId: apiData.nationalId || 'N/A'
      };
      
      setUserData(mappedData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfileError(error.response?.data?.message || 'Failed to load user data. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleBusinessClick = async () => {
    setShowBusinessBoxes(true);
    setShowProfile(false);
    setShowAddBusinessForm(false);
    setShowAbout(false);
    setShowMembership(false);
    setActiveSection('business');
    setIsBusinessLoading(true);
    setBusinessError('');

    try {
      // Get user ID from token
      const userId = getUserIdFromToken();
      
      if (!userId) {
        console.error('No user ID found in token');
        setBusinessError('User not authenticated. Please log in again.');
        return;
      }

      // Fetch user's businesses
      const response = await axiosClient.post('/business/user-businesses', { userId });
      console.log('Business API response:', response.data);
      
      const rawData = normalizeBusinesses(response.data);
      
      // Map API field names to component prop names and fetch tax for each business
      const mappedBusinesses = await Promise.all(rawData.map(async (business) => {
        const businessId = business.id || business.businessId;
        let taxAmount = null;

        // Fetch tax calculation for this business
        if (businessId) {
          try {
            console.log('Fetching tax for business ID:', businessId);
            const taxResponse = await axiosClient.post('/business/calculate-tax', { businessId });
            console.log('Tax calculation response for business', businessId, ':', taxResponse.data);
            
            // Check if taxAmount exists in the response
            if (taxResponse.data && typeof taxResponse.data.taxAmount !== 'undefined') {
              taxAmount = taxResponse.data.taxAmount;
              console.log('Extracted tax amount:', taxAmount);
            } else {
              console.warn('No taxAmount found in response for business', businessId);
            }
          } catch (taxError) {
            console.error('Error fetching tax for business', businessId, ':', taxError);
            console.error('Error details:', taxError.response?.data);
            // Continue without tax amount if request fails
          }
        }

        return {
          id: businessId || Math.random().toString(),
          name: business.businessName || business.name,
          taxNumber: business.taxRegNumber || business.taxNumber || business.taxRegistrationNumber,
          taxAmount: taxAmount
        };
      }));
      
      setBusinesses(mappedBusinesses);
    } catch (error) {
      console.error('Error fetching business data:', error);
      setBusinessError(error.response?.data?.message || 'Failed to load businesses. Please try again.');
      setBusinesses([]);
    } finally {
      setIsBusinessLoading(false);
    }
  };

  const handleAddBusinessClick = () => {
    // Show add business form
    setShowAddBusinessForm(true);
    setShowBusinessBoxes(false);
    setShowProfile(false);
    setShowAbout(false);
    setShowMembership(false);
    setActiveSection('business');
  };

  const handleMembershipClick = () => {
    // Show membership plans section
    setShowMembership(true);
    setShowProfile(false);
    setShowBusinessBoxes(false);
    setShowAddBusinessForm(false);
    setShowAbout(false);
    setActiveSection('membership');
  };

  const handleLogoClick = () => {
    // Show about section and hide all other boxes
    setShowAbout(true);
    setShowProfile(false);
    setShowBusinessBoxes(false);
    setShowAddBusinessForm(false);
    setShowMembership(false);
    setActiveSection('about');
  };

  const handlePayClick = (business) => {
    // Navigate to checkout page with business data
    navigate('/checkout', { state: { business } });
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

    const { name, taxRegistrationNumber } = businessForm;
    if (!name || !taxRegistrationNumber) {
      setBusinessFormError('Please fill in all fields.');
      return;
    }

    // Get user ID from token
    const userId = getUserIdFromToken();
    
    if (!userId) {
      setBusinessFormError('User not authenticated. Please log in again.');
      return;
    }

    setIsSubmittingBusiness(true);
    try {
      const payload = {
        userId,
        businessName: name,
        taxRegNumber: taxRegistrationNumber
      };

      const response = await axiosClient.post('/business/add', payload);

      // Append new business to the list
      const created = response?.data || payload;
      setBusinesses((prev) => [...prev, created]);
      setBusinessFormSuccess('Business added successfully.');
      
      // Clear form
      setBusinessForm({
        name: '',
        taxRegistrationNumber: ''
      });
      
      // Optionally close form and show businesses after a delay
      setTimeout(() => {
        setShowAddBusinessForm(false);
        setShowBusinessBoxes(true);
      }, 1500);
    } catch (error) {
      console.error('Error adding business:', error);
      setBusinessFormError(error.response?.data?.message || 'Failed to add business. Please try again.');
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  // Handle navigation state from businessDetail page
  useEffect(() => {
    const state = location.state;
    if (state && Object.keys(state).length > 0) {
      if (state.showProfile) {
        handleProfileClick();
      } else if (state.showBusinesses) {
        handleBusinessClick();
      }
      
      // Clear the state to prevent re-triggering on re-renders
      // Use setTimeout to defer the state reset to the next tick
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="home-container">
      <HomeLeft
        onProfileClick={handleProfileClick}
        onBusinessClick={handleBusinessClick}
        onAddBusinessClick={handleAddBusinessClick}
        onMembershipClick={handleMembershipClick}
        onLogoClick={handleLogoClick}
        activeSection={activeSection}
      />
      
      {/* Main content area */}
      <div className="home-main-content">
        {/* About Section - displayed when logo is clicked */}
        {showAbout && (
          <div style={{ 
            width: '100%',
            maxWidth: '900px',
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ 
                fontSize: '42px', 
                fontWeight: '800',
                color: '#ffffff',
                marginBottom: '16px',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                Smart Tax Compliance Made Simple
              </h2>
              <p style={{ 
                fontSize: '24px', 
                color: '#e5e7eb', 
                fontWeight: '500',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}>
                For SMEs and Freelancers in Egypt
              </p>
            </div>
            
            <div style={{ 
              fontSize: '18px', 
              lineHeight: '1.9', 
              color: '#f3f4f6',
              maxWidth: '800px',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              <p style={{ marginBottom: '28px', fontWeight: '400' }}>
                Daleel is your trusted partner in navigating Egypt's tax landscape. We help small and medium enterprises 
                and freelancers stay compliant with the Egyptian Tax Authority effortlessly.
              </p>
              
              <p style={{ marginBottom: '28px', fontWeight: '400' }}>
                Managing your business taxes shouldn't be complicated. With Daleel, you can register your business, 
                track all your invoices, and get accurate tax calculations automatically—all in one secure place.
              </p>
              
              <p style={{ marginBottom: '28px', fontWeight: '400' }}>
                We keep you organized with clear monthly and annual summaries of your income, so you always know where 
                your business stands. No more spreadsheets, no more guesswork—just straightforward tax management 
                that works for you.
              </p>
              
              <p style={{ marginBottom: '0', fontWeight: '400' }}>
                Whether you're running a growing business or working independently, Daleel gives you the peace of mind 
                that comes with knowing your taxes are handled properly, so you can focus on what you do best.
              </p>
            </div>
            
            {businesses.length === 0 && (
              <button
                onClick={async () => {
                  await handleBusinessClick();
                  setShowAddBusinessForm(true);
                  setShowBusinessBoxes(false);
                }}
                style={{
                  marginTop: '40px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                Get Started - Add Your Business
              </button>
            )}
          </div>
        )}

        {/* User Profile Info Box - displayed in center */}
        {showProfile && (
          <div className="profile-info-box-center">
            <div className="profile-info-header">
              <h3>User Information</h3>
            </div>
            {isProfileLoading ? (
              <div className="profile-loading">Loading user data...</div>
            ) : profileError ? (
              <div className="profile-error">{profileError}</div>
            ) : userData ? (
              <div className="profile-info-content">
                <div className="profile-info-item">
                  <span className="profile-info-label">Name:</span>
                  <span className="profile-info-value">{userData.name}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Email:</span>
                  <span className="profile-info-value">{userData.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Phone Number:</span>
                  <span className="profile-info-value">{userData.phoneNumber}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">National ID:</span>
                  <span className="profile-info-value">{userData.nationalId}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Birth Date:</span>
                  <span className="profile-info-value">{calculateBirthDateFromNationalId(userData.nationalId)}</span>
                </div>
              </div>
            ) : null}
          </div>
          
        )}

        {showBusinessBoxes && (
          <div className="business-box-wrapper">
            <div className="profile-info-header">
              <h3>User Businesses</h3>
            </div>
            {isBusinessLoading ? (
              <div className="business-loading">Loading businesses...</div>
            ) : businessError ? (
              <div className="business-error">{businessError}</div>
            ) : businesses.length === 0 ? (
              <div className="empty-businesses-container">
                <div 
                  className="business-box add-business-box-center" 
                  onClick={handleAddBusinessClick}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="add-business-content">
                    <div className="add-business-icon">➕</div>
                    <span className="add-business-text">Add Business</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="business-box-grid">
                {businesses.map((business, index) => (
                  <BusinessBox
                    key={business.id}
                    name={business.name}
                    taxNumber={business.taxNumber}
                    taxAmount={business.taxAmount}
                    onClick={() => navigate('/businessDetail', { state: { business } })}
                    onPay={() => handlePayClick(business)}
                  />
                ))}
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
                  required
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
                  required
                />
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

        {/* Membership Plans Section */}
        {showMembership && (
          <div className="membership-content-wrapper">
            <div className="membership-header">
              <h1>Choose Your Membership Plan</h1>
              <p>Select the perfect plan for your business needs</p>
            </div>

            <div className="plans-grid">
              {[
                {
                  id: 'monthly',
                  name: 'Monthly Plan',
                  duration: '1 Month',
                  price: 299,
                  features: [
                    'Unlimited Business Management',
                    'Invoice Tracking',
                    'Tax Calculations',
                    'Email Support',
                    'Monthly Reports'
                  ]
                },
                {
                  id: 'semi-annual',
                  name: '6 Months Plan',
                  duration: '6 Months',
                  price: 1499,
                  originalPrice: 1794,
                  discount: '17% OFF',
                  features: [
                    'All Monthly Plan Features',
                    'Priority Support',
                    'Advanced Analytics',
                    'Export to Excel/PDF',
                    'Multi-user Access (up to 3 users)'
                  ],
                  popular: true
                },
                {
                  id: 'annual',
                  name: 'Annual Plan',
                  duration: '12 Months',
                  price: 2699,
                  originalPrice: 3588,
                  discount: '25% OFF',
                  features: [
                    'All 6 Months Plan Features',
                    '24/7 Premium Support',
                    'Custom Integrations',
                    'Dedicated Account Manager',
                    'Unlimited Users',
                    'API Access'
                  ]
                }
              ].map((plan) => (
                <div 
                  key={plan.id} 
                  className={`plan-card ${plan.popular ? 'popular' : ''}`}
                >
                  {plan.popular && <div className="popular-badge">Most Popular</div>}
                  {plan.discount && <div className="discount-badge">{plan.discount}</div>}
                  
                  <div className="plan-header">
                    <h2>{plan.name}</h2>
                    <p className="plan-duration">{plan.duration}</p>
                  </div>

                  <div className="plan-pricing">
                    {plan.originalPrice && (
                      <span className="original-price">{plan.originalPrice.toLocaleString()} EGP</span>
                    )}
                    <div className="price">
                      <span className="amount">{plan.price.toLocaleString()}</span>
                      <span className="currency">EGP</span>
                    </div>
                    <p className="price-note">per {plan.duration.toLowerCase()}</p>
                  </div>

                  <div className="plan-features">
                    <ul>
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <span className="checkmark">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className="select-plan-btn"
                    onClick={() => {
                      console.log('Selected plan:', plan.id);
                    }}
                  >
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

