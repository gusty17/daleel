import React from 'react';
import './LandingBody.css';

function LandingBody() {
  return (
    <section className="landing-body">
      <div className="landing-text">
        <h1>Smart Tax Compliance Made Simple</h1>
        <p className="subtitle">
          Daleel — Your trusted partner in navigating Egypt's tax landscape for SMEs and Freelancers.
        </p>
      </div>
      <div className="landing-highlights">
        <p>Daleel helps small and medium enterprises and freelancers stay compliant with the Egyptian Tax Authority effortlessly.</p>
        <p>Register your business, track all your invoices, and get accurate tax calculations automatically — all in one secure place.</p>
        <p>We keep you organized with clear monthly and annual summaries of your income, so you always know where your business stands. No more spreadsheets, no more guesswork — just straightforward tax management that works for you.</p>
      </div>
    </section>
  );
}

export default LandingBody;
