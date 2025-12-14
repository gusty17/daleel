import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './membership.css';
import HomeLeft from '../../components/home_left/HomeLeft';

function Membership() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      duration: '1 Quarter',
      quarters: 1,
      price: 450,
      features: [
        'Tax Calculation for 1 Quarter',
        'Invoice Tracking & Management',
        'Quarterly Tax Reports',
        'Email Support',
        'Export to PDF'
      ]
    },
    {
      id: 'bi-quarterly',
      name: 'Bi-Quarterly Plan',
      duration: '2 Quarters',
      quarters: 2,
      price: 850,
      originalPrice: 900,
      discount: '6% OFF',
      features: [
        'Tax Calculation for 2 Quarters',
        'All Quarterly Plan Features',
        'Priority Support',
        'Advanced Analytics',
        'Export to Excel/PDF'
      ],
      popular: true
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      duration: '4 Quarters',
      quarters: 4,
      price: 1500,
      originalPrice: 1800,
      discount: '17% OFF',
      features: [
        'Tax Calculation for All 4 Quarters',
        'All Bi-Quarterly Plan Features',
        '24/7 Premium Support',
        'Multi-Business Support',
        'Dedicated Account Manager',
        'API Access & Integrations'
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

  const handleSelectPlan = (plan) => {
    console.log('Selected plan:', plan.id);
    navigate('/checkout', { state: { plan } });
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
                onClick={() => handleSelectPlan(plan)}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Membership;
