import React, { useState } from 'react';
import './signup.css';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthImageSide from '../../components/sign_left_side/AuthImageSide';
import AuthHeader from '../../components/sign_right_side/AuthHeader';
import axiosClient from '../../api/axiosClient';
import { getPasswordStrength, 
         hasMinLength,
         hasNumberOrSymbol,
         passwordsMatch } from '../../utils/passwordUtils';
         

// email pass full name mobile number nid 
function Signup() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNationalIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 14) {
      setNationalId(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (nationalId.length !== 14) {
      alert('National ID must be exactly 14 digits!');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axiosClient.post('/signup', {
        email,
        fullName,
        mobileNumber,
        nationalId,
        password
      });
      
      // Success handling
      console.log('Signup successful:', response.data);
      alert('Account created successfully!');
      
      // Clear form
      setEmail('');
      setFullName('');
      setMobileNumber('');
      setNationalId('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Error handling
      console.error('Signup error:', error);
      if (error.response) {
        // Server responded with error status
        alert(error.response.data?.message || 'Signup failed. Please try again.');
      } else if (error.request) {
        // Request was made but no response received
        alert('Network error. Please check your connection.');
      } else {
        // Something else happened
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGmailLogin = () => {
    console.log('Login with Gmail');
    // Handle Gmail login
  };

  const handleAppleLogin = () => {
    console.log('Login with Apple');
    // Handle Apple login
  };

  const handleMicrosoftLogin = () => {
    console.log('Login with Microsoft');
    // Handle Microsoft login
  };

  return (
    <div className="signup-container">
      {/* Left side with background image */}
      <AuthImageSide />

      {/* Right side with form */}
      <div className="signup-right">
        <div className="signup-form-wrapper">
          <AuthHeader />

          {/* Form */}
          <form className="signup-form" onSubmit={handleSubmit}>
            <Input 
              type="text" 
              placeholder="Full Name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              type="tel" 
              placeholder="Mobile Number" 
              value={mobileNumber} 
              onChange={(e) => setMobileNumber(e.target.value)} 
            />
            <Input 
              type="text" 
              placeholder="National ID (14 digits)" 
              value={nationalId} 
              onChange={handleNationalIdChange} 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
            
            {/* Password Validation Checks */}
            <div className="password-validation">
              <div className="validation-item">
                <span className={`validation-check ${getPasswordStrength(password) && getPasswordStrength(password) !== 'Weak' ? 'valid' : ''}`}>
                  {getPasswordStrength(password) && getPasswordStrength(password) !== 'Weak' ? '✓' : ''}
                </span>
                <span className="validation-text">
                  Password Strength: <strong>{getPasswordStrength(password) || 'Weak'}</strong>
                </span>
              </div>
              <div className="validation-item">
                <span className={`validation-check ${hasMinLength(password) ? 'valid' : ''}`}>
                  {hasMinLength(password) ? '✓' : ''}
                </span>
                <span className="validation-text">At least 8 characters</span>
              </div>
              <div className="validation-item">
                <span className={`validation-check ${hasNumberOrSymbol(password) ? 'valid' : ''}`}>
                  {hasNumberOrSymbol(password) ? '✓' : ''}
                </span>
                <span className="validation-text">Contains a number or symbol</span>
              </div>
              <div className="validation-item">
                <span className={`validation-check ${passwordsMatch(password, confirmPassword) ? 'valid' : ''}`}>
                  {passwordsMatch(password, confirmPassword) ? '✓' : ''}
                </span>
                <span className="validation-text">Passwords match</span>
              </div>
            </div>

            <Button type="submit" className="signup-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Social Login Buttons */}
          <div className="social-login">
            <Button 
              type="button" 
              className="social-btn gmail-btn"
              onClick={handleGmailLogin}
            >
              <img src="/images/gmail_logo.png" alt="Gmail" className="social-logo" />
            </Button>
            <Button 
              type="button" 
              className="social-btn apple-btn"
              onClick={handleAppleLogin}
            >
              <img src="/images/apple_logo.png" alt="Apple" className="social-logo" />
            </Button>
            <Button 
              type="button" 
              className="social-btn microsoft-btn"
              onClick={handleMicrosoftLogin}
            >
              <img src="/images/microsoft_logo.png" alt="Microsoft" className="social-logo" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

