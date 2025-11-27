import React from 'react';
import './landing.css';
import LandingHeader from '../../components/landing_heading/LandingHeader';
import LandingBody from '../../components/landing_body/LandingBody';
import LandingPartner from '../../components/landing_partner/LandingPartner';

function Landing() {
  return (
    <div className="landing-page">
      <LandingHeader />
      <LandingBody />
      <LandingPartner />
    </div>
  );
}

export default Landing;
