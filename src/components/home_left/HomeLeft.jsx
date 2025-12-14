import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeLeft.css';

function HomeLeft({ onProfileClick, onBusinessClick, onAddBusinessClick, onMembershipClick, onLogoClick, activeSection }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    // Navigate to login page
    navigate('/login');
  };

  const handleLogoClick = () => {
    // Call parent's onLogoClick to hide all boxes
    if (onLogoClick) {
      onLogoClick();
    }
    // Navigate to home page
    navigate('/home');
  };

  return (
    <div className="home-left">
      {/* Logo at the top */}
      <div className="home-left-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img 
          src="/images/daleel_logo.png" 
          alt="Daleel Logo" 
          className="home-logo-img"
        />
      </div>

      {/* User Profile */}
      <div 
        className={`home-left-item ${activeSection === 'profile' ? 'active' : ''}`}
        onClick={onProfileClick}
      >
        <div className="home-left-icon">👤</div>
        <span className="home-left-text">User Profile</span>
      </div>

      {/* User Business */}
      <div 
        className={`home-left-item ${activeSection === 'business' ? 'active' : ''}`}
        onClick={onBusinessClick}
      >
        <div className="home-left-icon">🏢</div>
        <span className="home-left-text">User Business</span>
      </div>

      {/* Membership Plans */}
      <div 
        className={`home-left-item ${activeSection === 'membership' ? 'active' : ''}`}
        onClick={() => {
          if (typeof onMembershipClick === 'function') {
            onMembershipClick();
            return;
          }
          // fallback: always navigate to the membership route
          navigate('/membership');
        }}
      >
        <div className="home-left-icon">⭐</div>
        <span className="home-left-text">Membership Plans</span>
      </div>

      {/* Log Out - positioned at bottom */}
      <div className="home-left-item home-left-logout" onClick={handleLogout}>
        <div className="home-left-icon">🚪</div>
        <span className="home-left-text">Log Out</span>
      </div>
    </div>
  );
}

export default HomeLeft;

