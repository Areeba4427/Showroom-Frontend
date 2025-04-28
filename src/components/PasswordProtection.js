// src/components/PasswordProtection.js
import React, { useState, useEffect } from 'react';

const PasswordProtection = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check if already authenticated in session storage
  useEffect(() => {
    const authenticated = sessionStorage.getItem('isAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Replace 'your-secure-password' with your actual password
    const correctPassword = 'naeem123';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="password-screen">
      <div className="password-container">
        <h2>Enter Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text" // Changed from "password" to "text" to show characters instead of bullets
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Access Application</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;