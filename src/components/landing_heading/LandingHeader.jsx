import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingHeader.css';

const navItems = ['Home', 'Plans', 'Contact'];

function LandingHeader() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/signup');
  };

  const handleNavClick = (item) => {
    if (item === 'Plans') {
      const plansSection = document.getElementById('plans-section');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item === 'Contact') {
      const footer = document.getElementById('footer-section');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="landing-header">
      <div className="header-left">
        <img src="/images/daleel_logo.png" alt="Daleel logo" className="daleel-logo" />
      </div>
      <nav className="header-center">
        {navItems.map((item) => (
          <button key={item} type="button" className="nav-pill" onClick={() => handleNavClick(item)}>
            {item}
          </button>
        ))}
      </nav>
      <div className="header-right">
        <button type="button" className="register-btn" onClick={handleRegisterClick}>
          Join Us
        </button>
      </div>
    </header>
  );
}

export default LandingHeader;

