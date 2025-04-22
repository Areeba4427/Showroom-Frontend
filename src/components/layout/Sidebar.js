import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaCar,
  FaPlus,
  FaMoneyBillWave,
  FaChartLine
} from 'react-icons/fa';
import  logo_processed from '../asset/logo_processed.jpg'
const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="logo-container">
        {/* Replace with your actual logo */}
        <div className="logo">
        <img src={logo_processed} alt="Logo" />
        </div>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaHome />
            <span>Dashboard / مرکزی صفحہ </span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaCar />
            <span>Buy & Sell / خرید و فروخت</span>
          </NavLink>
        </li>
        {/* <li>
          <NavLink to="/add-car" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaPlus />
            <span>Add Car</span>
          </NavLink>
        </li> */}
        <li>
          <NavLink to="/cashflow" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaMoneyBillWave />
            <span>CashFlow / نقد بہاؤ</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/credit-sale" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaPlus />
            <span>Credit Sale / کریڈٹ فروخت </span>
          </NavLink>
        </li>
       
      </ul>

      {/* Contact details at the bottom */}
      <div className="contact-details">
        <p>Address: Main Bypass Road Khanpur , Khanpur Janubi, Pakistan, 64000</p>
        <p>Phone: 0300 9408930</p>
        
      </div>
    </div>
  );
};

export default Sidebar;