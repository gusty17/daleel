import React from 'react';
import { useNavigate } from 'react-router-dom';
import './taxRegistrationGuide.css';

function TaxRegistrationGuide() {
  const navigate = useNavigate();

  return (
    <div className="tax-guide-container">
      <div className="tax-guide-content">
        <button className="tax-guide-back-btn" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
        
        <div className="tax-guide-header">
          <h1>How to Get a Tax Registration Number</h1>
          <p className="tax-guide-subtitle">Follow these steps to register for a Tax Registration Number with the Egyptian Tax Authority</p>
        </div>

        <div className="tax-guide-steps">
          <div className="tax-guide-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Prepare Your Documents</h3>
              <p>You only need two things: your valid National ID and a proof of address (like a rental contract or a recent electricity bill).</p>
            </div>
          </div>

          <div className="tax-guide-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Visit the Nearest Tax Office</h3>
              <p>Go to the "Ma'mouria" (Tax Office) closest to the address on your ID. You do not need an appointment—just walk in.</p>
            </div>
          </div>

          <div className="tax-guide-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Get Your Tax Number</h3>
              <p>Ask to open a file under the "SME Law." It is free, and they will give you your 9-digit Tax Registration Number immediately.</p>
            </div>
          </div>
        </div>

        <div className="tax-guide-footer">
          <p>Got your 9-digit number? Click the button below to activate your account and start filing.</p>
          <button className="tax-guide-btn-primary" onClick={() => navigate('/home')}>
            Go Back to Add Business
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaxRegistrationGuide;
