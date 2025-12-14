import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
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
  const [loginError, setLoginError] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); // reset error

    if (!email || !password) {
      setLoginError('Please enter email and password');
      return;
    }

    if (!captchaValue) {
      setLoginError('Please complete the CAPTCHA verification');
      return;
    }

    try {
      // POST request to backend login
      const res = await axiosClient.post('/users/login', { email, password });
      
      // Store the access token from the session
      if (res.data.session && res.data.session.access_token) {
        localStorage.setItem('access_token', res.data.session.access_token);
      } else if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      } else if (res.data.token) {
        localStorage.setItem('access_token', res.data.token);
      }
      
      navigate('/home');
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || 'Invalid email or password');
      setCaptchaValue(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
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
            {loginError && (
              <div className="form-message form-error" style={{ marginBottom: 12 }}>{loginError}</div>
            )}
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
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(value) => setCaptchaValue(value)}
              />
            </div>
            <Button type="submit" className="login-submit-btn" disabled={!captchaValue}>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
