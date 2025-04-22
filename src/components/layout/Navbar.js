// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaCar className="navbar-icon" />
          <span>Naeem Motors Khanpur</span>
        </Link>
        <div className="navbar-user">
          <span>Admin</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



