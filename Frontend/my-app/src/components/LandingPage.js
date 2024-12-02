import React from 'react';

const LandingPage = ({ onSupportClick }) => {
  return (
    <div className="landing-page">
      <h1>Welcome to Our E-Commerce Site!</h1>
      <p>Explore our products and enjoy your shopping experience.</p>
      <button onClick={onSupportClick} className="customer-support-button">
        Customer Support
      </button>
      {/* Add more e-commerce related content here */}
    </div>
  );
};

export default LandingPage;