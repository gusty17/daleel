import React, { useState } from 'react';
import './login.css';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthImageSide from '../../components/sign_left_side/AuthImageSide';
import AuthHeader from '../../components/sign_right_side/AuthHeader';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Email:', email, 'Password:', password);
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
    <div className="login-container">
      {/* Left side with background image */}
      <AuthImageSide />

      {/* Right side with form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <AuthHeader />

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />

            <Button type="submit" className="login-submit-btn">
              Login
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

export default Login;

