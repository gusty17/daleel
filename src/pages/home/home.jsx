import React, { useState } from 'react';
import './home.css';
import HomeLeft from '../../components/home_left/HomeLeft';
import axiosClient from '../../api/axiosClient';

function Home() {
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default user data
  const defaultUserData = {
    name: 'youssef',
    email: 'youssef@gmail.com',
    phoneNumber: '01094608093',
    nationalId: '30303030303030'
  };

  const handleProfileClick = async () => {
    if (showProfile) {
      // If already showing, just close it
      setShowProfile(false);
      return;
    }

    setIsLoading(true);
    setShowProfile(true);

    try {
      // Fetch user data from backend
      const response = await axiosClient.get('/user/profile');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use default data if API fails
      setUserData(defaultUserData);
    } finally {
      setIsLoading(false);
    }
  };

  // Use default data if no user data is loaded yet
  const displayData = userData || defaultUserData;

  return (
    <div className="home-container">
      <HomeLeft onProfileClick={handleProfileClick} />
      
      {/* Main content area */}
      <div className="home-main-content">
        {/* User Profile Info Box - displayed in center */}
        {showProfile && (
          <div className="profile-info-box-center">
            <div className="profile-info-header">
              <h3>User Information</h3>
              <button className="profile-close-btn" onClick={() => setShowProfile(false)}>×</button>
            </div>
            {isLoading ? (
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
      </div>
    </div>
  );
}

export default Home;

