import React, { useState, useEffect } from 'react';
import './landing.css';
import LandingHeader from '../../components/landing_heading/LandingHeader';
import LandingBody from '../../components/landing_body/LandingBody';
import LandingPartner from '../../components/landing_partner/LandingPartner';

function Landing() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="landing-page">
      <LandingHeader />
      <LandingBody />
      <LandingPartner />
      
      {/* Plans Section */}
      <section id="plans-section" className="plans-section">
        <h2 className="plans-title">Choose Your Plan</h2>
        <p className="plans-subtitle">Select the perfect plan for your business needs</p>
        
        <div className="plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              {plan.discount && <div className="discount-badge">{plan.discount}</div>}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
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
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="footer-section" className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/images/daleel_logo.png" alt="Daleel Logo" className="footer-logo" />
            <p className="footer-description">Smart Tax Compliance Made Simple for SMEs and Freelancers in Egypt</p>
          </div>
          
          <div className="footer-section">
            <h4>Contact Us</h4>
            <div className="contact-info-footer">
              <p><strong>Email:</strong> support@daleel.eg</p>
              <p><strong>Phone:</strong> +20 123 456 7890</p>
              <p><strong>Address:</strong> Cairo, Egypt</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Daleel. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}

export default Landing;
