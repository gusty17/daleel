import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
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
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef();

  const handleNationalIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 14) {
      setNationalId(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    setSignupError('');
    setSignupSuccess('');
    
    if (!captchaValue) {
      setSignupError('Please complete the CAPTCHA verification');
      return;
    }
    
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (nationalId.length !== 14) {
      setSignupError('National ID must be exactly 14 digits.');
      return;
    }

    setIsLoading(true);
    
    try {

      console.log('Submitting signup form with data:', { email, fullName, mobile, nationalId, password });

      const response = await axiosClient.post('/users/register', {
        email,
        fullName,
        mobile,
        nationalId,
        password
      });
      
      // Success handling
      console.log('Signup successful:', response.data);
      
      // Store the access token from the session
      if (response.data.session && response.data.session.access_token) {
        localStorage.setItem('access_token', response.data.session.access_token);
      } else if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      } else if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
      }
      
      setSignupSuccess('Account created successfully. Redirecting to login...');
      
      // Clear form
      setEmail('');
      setFullName('');
      setMobile('');
      setNationalId('');
      setPassword('');
      setConfirmPassword('');
      // Navigate after short delay so user sees success message
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      // Error handling
      console.error('Signup error:', error);
      if (error.response) {
        // Server responded with error status
        setSignupError(error.response.data?.message || 'Signup failed. Please try again.');
      } else if (error.request) {
        // Request was made but no response received
        setSignupError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setSignupError('An error occurred. Please try again.');
      }
      setCaptchaValue(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } finally {
      setIsLoading(false);
    }
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
            {signupError && (
              <div className="form-message form-error" style={{ marginBottom: 12 }}>{signupError}</div>
            )}
            {signupSuccess && (
              <div className="form-message form-success" style={{ marginBottom: 12 }}>{signupSuccess}</div>
            )}
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
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)} 
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

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(value) => setCaptchaValue(value)}
              />
            </div>

            <Button type="submit" className="signup-submit-btn" disabled={isLoading || !captchaValue}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

