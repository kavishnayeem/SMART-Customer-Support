// frontend/src/components/Navbar.js
import React from 'react';
import '../App.css';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-content">
      <svg className="chat-icon" viewBox="0 0 24 24" width="24" height="24">
        <path
          fill="currentColor"
          d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"
        />
      </svg>
      <h1>SMART Customer Support Chatbot</h1>
    </div>
  </nav>
);

export default Navbar;
