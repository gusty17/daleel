import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeLeft.css';

function HomeLeft({ onProfileClick, onBusinessClick, onAddBusinessClick, onLogoClick }) {
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
      <div className="home-left-item" onClick={onProfileClick}>
        <div className="home-left-icon">👤</div>
        <span className="home-left-text">User Profile</span>
      </div>

      {/* User Business */}
      <div className="home-left-item" onClick={onBusinessClick}>
        <div className="home-left-icon">🏢</div>
        <span className="home-left-text">User Business</span>
      </div>

      {/* Add Business */}
      <div className="home-left-item" onClick={onAddBusinessClick}>
        <div className="home-left-icon">➕</div>
        <span className="home-left-text">Add Business</span>
      </div>

      {/* Log Out */}
      <div className="home-left-item" onClick={handleLogout}>
        <div className="home-left-icon">🚪</div>
        <span className="home-left-text">Log Out</span>
      </div>
    </div>
  );
}

export default HomeLeft;

