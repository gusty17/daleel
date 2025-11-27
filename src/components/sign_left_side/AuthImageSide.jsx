import React from 'react';
import './AuthImageSide.css';

function AuthImageSide() {
  return (
    <div className="auth-image-side">
      <img 
        src="/images/signup_image.png" 
        alt="Auth background" 
        className="auth-background-image"
      />
    </div>
  );
}

export default AuthImageSide;

