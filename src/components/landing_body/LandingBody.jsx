import React from 'react';
import './LandingBody.css';

function LandingBody() {
  return (
    <section className="landing-body">
      <div className="landing-text">
        <h1>No more confusion</h1>
        <p className="subtitle">
          Daleel — where real experiences guide you through every form, stamp, and signature.
        </p>
      </div>
      <img
        src="/images/landing_image.png"
        alt="Landing visual"
        className="landing-visual"
      />
      <div className="landing-highlights">
        <p>Daleel is a community-powered platform that helps Egyptians navigate government paperwork with ease.</p>
        <p>We collect and organize real experiences from people who have already completed their paperwork — showing you the exact steps, required documents, fees, and waiting times.</p>
        <p>Instead of wasting hours searching or asking around, you can now find reliable, step-by-step guides written by real citizens — and share your own experience to help others.</p>
      </div>
    </section>
  );
}

export default LandingBody;
