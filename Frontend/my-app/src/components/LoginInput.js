// frontend/src/components/LoginInput.js
import React, { useState } from 'react';
import '../App.css';

const LoginInput = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      onSubmit(email.trim(), password.trim());
    }
  };

  return (
    <form className="login-input" onSubmit={handleSubmit}>
      <p>For testing purposes, use the following credentials:</p>
      <p>Email: alex.parker@example.com</p>
      <p>Password: Password123!</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email..."
        aria-label="Email input"
        autoComplete="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password..."
        aria-label="Password input"
        autoComplete="current-password"
      />
      <button type="submit" aria-label="Submit login">
        Login
      </button>
    </form>
  );
};

export default LoginInput;
