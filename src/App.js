import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PasswordProtection from './components/PasswordProtection';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CarDetails from './pages/CarDetails';
import CashflowDashboard from './pages/CashFlowDashboard';
import CarForm from './pages/CarForm';
import AddCashIn from './pages/AddCashIn';
import CreditSale from './pages/CreditSale';
import './App.css';
import Investor from './pages/Investor';

function App() {
  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        <PasswordProtection>
          <div className="main-content">
            <Navbar />
            <div className="content-area">
              <Sidebar />
              <div className="page-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/car/:id" element={<CarDetails />} />
                  <Route path="/car-form" element={<CarForm />} />
                  <Route path="/car-form/:id" element={<CarForm />} />
                  <Route path="/car-details" element={<CarDetails />} />
                  <Route path="/edit-car/:id" element={<CarForm />} />
                  {/* Redirect /add-car to /car-form to handle any existing links */}
                  <Route path="/add-car" element={<Navigate to="/car-form" />} />

                  <Route path="/credit-sale" element={<CreditSale />} />


                  <Route path="/cashflow" element={<CashflowDashboard />} />   
                  <Route path="/add-cash-in" element={<AddCashIn />} />

                  <Route path="/liability" element={<Investor />} />
                </Routes>
              </div>
            </div>
          </div>
        </PasswordProtection>
      </div>
    </Router>
  );
}

export default App;