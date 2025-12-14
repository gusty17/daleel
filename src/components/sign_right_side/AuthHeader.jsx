import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthHeader.css';

function AuthHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current route
  const activeTab = location.pathname === '/login' ? 'signin' : 'signup';

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="auth-header">
      {/* Sign In / Sign Up Tabs */}
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
          onClick={handleSignIn}
        >
          Sign In
        </button>
        <button
          className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
          onClick={handleSignUp}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default AuthHeader;

