import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import Input from "../../components/Input";
import Button from "../../components/Button";
import AuthImageSide from "../../components/sign_left_side/AuthImageSide";
import AuthHeader from "../../components/sign_right_side/AuthHeader";
import axiosClient from "../../api/axiosClient";
import {
  getPasswordStrength,
  hasMinLength,
  hasNumberOrSymbol,
  passwordsMatch,
} from "../../utils/passwordUtils";
import ReCAPTCHA from "react-google-recaptcha";

// email pass full name mobile number nid
function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [captchaCechked, setCaptchaChecked] = useState(false);
  const sitekey = "6LffdiQsAAAAAPhdfY-IlSIFZUEktfNT9tTdJGwC";
  function onChange(value) {
    console.log("Captcha value:", value);
    setCaptchaChecked(true);
  }

  const handleNationalIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 14) {
      setNationalId(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    setSignupError("");
    setSignupSuccess("");
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (nationalId.length !== 14) {
      setSignupError("National ID must be exactly 14 digits.");
      return;
    }
    if (!captchaCechked) {
      setSignupError("Please complete the CAPTCHA.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting signup form with data:", {
        email,
        fullName,
        mobile,
        nationalId,
        password,
      });

      const response = await axiosClient.post("/users/register", {
        email,
        fullName,
        mobile,
        nationalId,
        password,
      });

      // Success handling
      console.log("Signup successful:", response.data);

      // Store the access token from the session
      if (response.data.session && response.data.session.access_token) {
        localStorage.setItem(
          "access_token",
          response.data.session.access_token
        );
      } else if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      } else if (response.data.token) {
        localStorage.setItem("access_token", response.data.token);
      }

      setSignupSuccess("Account created successfully. Redirecting to login...");

      // Clear form
      setEmail("");
      setFullName("");
      setMobile("");
      setNationalId("");
      setPassword("");
      setConfirmPassword("");
      // Navigate after short delay so user sees success message
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      // Error handling
      console.error("Signup error:", error);
      if (error.response) {
        // Server responded with error status
        setSignupError(
          error.response.data?.message || "Signup failed. Please try again."
        );
      } else if (error.request) {
        // Request was made but no response received
        setSignupError("Network error. Please check your connection.");
      } else {
        // Something else happened
        setSignupError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGmailLogin = () => {
    console.log("Login with Gmail");
    // Handle Gmail login
  };

  const handleAppleLogin = () => {
    console.log("Login with Apple");
    // Handle Apple login
  };

  const handleMicrosoftLogin = () => {
    console.log("Login with Microsoft");
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
            {signupError && (
              <div
                className="form-message form-error"
                style={{ marginBottom: 12 }}
              >
                {signupError}
              </div>
            )}
            {signupSuccess && (
              <div
                className="form-message form-success"
                style={{ marginBottom: 12 }}
              >
                {signupSuccess}
              </div>
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
            <ReCAPTCHA sitekey={sitekey} onChange={onChange} />
            {/* Password Validation Checks */}
            <div className="password-validation">
              <div className="validation-item">
                <span
                  className={`validation-check ${
                    getPasswordStrength(password) &&
                    getPasswordStrength(password) !== "Weak"
                      ? "valid"
                      : ""
                  }`}
                >
                  {getPasswordStrength(password) &&
                  getPasswordStrength(password) !== "Weak"
                    ? "✓"
                    : ""}
                </span>
                <span className="validation-text">
                  Password Strength:{" "}
                  <strong>{getPasswordStrength(password) || "Weak"}</strong>
                </span>
              </div>
              <div className="validation-item">
                <span
                  className={`validation-check ${
                    hasMinLength(password) ? "valid" : ""
                  }`}
                >
                  {hasMinLength(password) ? "✓" : ""}
                </span>
                <span className="validation-text">At least 8 characters</span>
              </div>
              <div className="validation-item">
                <span
                  className={`validation-check ${
                    hasNumberOrSymbol(password) ? "valid" : ""
                  }`}
                >
                  {hasNumberOrSymbol(password) ? "✓" : ""}
                </span>
                <span className="validation-text">
                  Contains a number or symbol
                </span>
              </div>
              <div className="validation-item">
                <span
                  className={`validation-check ${
                    passwordsMatch(password, confirmPassword) ? "valid" : ""
                  }`}
                >
                  {passwordsMatch(password, confirmPassword) ? "✓" : ""}
                </span>
                <span className="validation-text">Passwords match</span>
              </div>
            </div>

            <Button
              type="submit"
              className="signup-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Social Login Buttons */}
          <div className="social-login">
            <Button
              type="button"
              className="social-btn gmail-btn"
              onClick={handleGmailLogin}
            >
              <img
                src="/images/gmail_logo.png"
                alt="Gmail"
                className="social-logo"
              />
            </Button>
            <Button
              type="button"
              className="social-btn apple-btn"
              onClick={handleAppleLogin}
            >
              <img
                src="/images/apple_logo.png"
                alt="Apple"
                className="social-logo"
              />
            </Button>
            <Button
              type="button"
              className="social-btn microsoft-btn"
              onClick={handleMicrosoftLogin}
            >
              <img
                src="/images/microsoft_logo.png"
                alt="Microsoft"
                className="social-logo"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
