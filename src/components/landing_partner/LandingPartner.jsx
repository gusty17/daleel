import React from 'react';
import './LandingPartner.css';

function LandingPartner() {
  return (
    <section className="landing-partner">
      <h1>Our Partners</h1>
      <div className="partner-boxes">
        <div className="partner-box">
          <img src="/images/eta_logo.png" alt="Egyptian Tax Authority" />
        </div>
        <div className="partner-box">
          <img src="/images/NTRA.jpg" alt="NTRA" />
        </div>
      </div>
    </section>
  );
}

export default LandingPartner;

