import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './membership.css';
import HomeLeft from '../../components/home_left/HomeLeft';

function Membership() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
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
  ];

  const handleProfileClick = () => {
    navigate('/home', { state: { showProfile: true } });
  };

  const handleBusinessClick = () => {
    navigate('/home', { state: { showBusinesses: true } });
  };

  const handleAddBusinessClick = () => {
    // Stay on membership page
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const handleSelectPlan = (planId) => {
    console.log('Selected plan:', planId);
  };

  return (
    <div className="membership-container">
      <HomeLeft
        onProfileClick={handleProfileClick}
        onBusinessClick={handleBusinessClick}
        onAddBusinessClick={handleAddBusinessClick}
        onLogoClick={handleLogoClick}
      />

      <div className="membership-main-content">
        <div className="membership-header">
          <h1>Choose Your Membership Plan</h1>
          <p>Select the perfect plan for your business needs</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
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
                onClick={() => handleSelectPlan(plan.id)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        <div className="membership-footer">
          <p>All plans include a 14-day money-back guarantee</p>
          <p>Need help choosing? <a href="#contact">Contact our sales team</a></p>
        </div>
      </div>
    </div>
  );
}

export default Membership;
