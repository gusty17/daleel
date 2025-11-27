import React from 'react';
import './LandingPartner.css';

function LandingPartner() {
  return (
    <section className="landing-partner">
      <h1>Our Partners</h1>
      <div className="partner-boxes">
        <div className="partner-box">
          <img src="/images/p1.png" alt="Partner 1" />
        </div>
        <div className="partner-box">
          <img src="/images/p2.png" alt="Partner 2" />
        </div>
        <div className="partner-box">
          <img src="/images/p3.png" alt="Partner 3" />
        </div>
        <div className="partner-box">
          <img src="/images/p4.png" alt="Partner 4" />
        </div>
        <div className="partner-box">
          <img src="/images/p5.png" alt="Partner 5" />
        </div>
        <div className="partner-box">
          <img src="/images/p6.png" alt="Partner 6" />
        </div>
      </div>
    </section>
  );
}

export default LandingPartner;

