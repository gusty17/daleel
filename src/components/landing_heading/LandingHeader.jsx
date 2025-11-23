import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingHeader.css';

const navItems = ['Home', 'About', 'Rewards', 'Contact'];

function LandingHeader() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/signup');
  };

  return (
    <header className="landing-header">
      <div className="header-left">
        <img src="/images/daleel_logo.png" alt="Daleel logo" className="daleel-logo" />
      </div>
      <nav className="header-center">
        {navItems.map((item) => (
          <button key={item} type="button" className="nav-pill">
            {item}
          </button>
        ))}
      </nav>
      <div className="header-right">
        <button type="button" className="register-btn" onClick={handleRegisterClick}>
          Register
        </button>
      </div>
    </header>
  );
}

export default LandingHeader;

