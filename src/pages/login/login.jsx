import React, { useState } from 'react';
import './login.css';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthImageSide from '../../components/sign_left_side/AuthImageSide';
import AuthHeader from '../../components/sign_right_side/AuthHeader';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // reset error

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      // POST request to backend login
      const res = await axiosClient.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  // Dummy handlers for social login (you can implement later)
  const handleGmailLogin = () => console.log('Login with Gmail');
  const handleAppleLogin = () => console.log('Login with Apple');
  const handleMicrosoftLogin = () => console.log('Login with Microsoft');

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

          {/* Show error */}
          {error && <div className="login-error">{error}</div>}

          {/* Social Login Buttons */}
          <div className="social-login">
            <Button type="button" className="social-btn gmail-btn" onClick={handleGmailLogin}>
              <img src="/images/gmail_logo.png" alt="Gmail" className="social-logo" />
            </Button>
            <Button type="button" className="social-btn apple-btn" onClick={handleAppleLogin}>
              <img src="/images/apple_logo.png" alt="Apple" className="social-logo" />
            </Button>
            <Button type="button" className="social-btn microsoft-btn" onClick={handleMicrosoftLogin}>
              <img src="/images/microsoft_logo.png" alt="Microsoft" className="social-logo" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
