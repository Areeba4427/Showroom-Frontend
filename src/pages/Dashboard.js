import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaMoneyBillWave, FaChartLine, FaWarehouse, FaArrowUp, FaArrowDown, FaPlusCircle, FaShoppingCart, FaHandHoldingUsd } from 'react-icons/fa';
import SummaryCard from '../components/dashboard/SummaryCard';
import { getCashflows, monthlyStats, getDailyCashflow } from '../api';

const Dashboard = () => {
  // Original dashboard state
  const [summary, setSummary] = useState({
    dailyCashFlow: 0,
    carsInStock: 0,
    carsSoldThisMonth: 0,
    inventoryValue: 0
  });
  
  // Monthly car stats state
  const [monthlyCars, setMonthlyCars] = useState({
    currentMonth: { month: 0, year: 0 },
    summary: {
      totalBought: 0,
      totalSold: 0,
      totalCommission: 0,
      profit: 0,
      carsBoughtCount: 0,
      carsSoldCount: 0
    },
    carsBought: [],
    carsSold: []
  });
  
  // Cashflow state
  const [cashflows, setCashflows] = useState([]);
  const [cashflowSummary, setCashflowSummary] = useState({
    cashIn: 0,
    cashOut: 0,
    netBalance: 0
  });
  const [todayCashflow, setTodayCashflow] = useState({
    cashIn: 0,
    cashOut: 0,
    balance: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date().toISOString().split('T')[0]); // Get today's date in YYYY-MM-DD format

  useEffect(() => {
    console.log('monthlyCars state changed:', monthlyCars);
    
    // Debug the month name calculation
    if (monthlyCars?.currentMonth?.month) {
      const monthNum = monthlyCars.currentMonth.month;
      const calculatedMonthName = getMonthName(monthNum);
      console.log(`Month number: ${monthNum}, calculated month name: ${calculatedMonthName}`);
    }
  }, [monthlyCars]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Starting API calls...");
        
        const [cashflowRes, monthlyRes, dailyCashflowRes] = await Promise.all([
          getCashflows(),
          monthlyStats(),
          getDailyCashflow(today)
        ]);
        
        // Log raw responses
        console.log('Monthly stats raw response:', monthlyRes);
        console.log('Monthly stats data:', monthlyRes.data);
        console.log('Daily cashflow response:', dailyCashflowRes);
        
        // Set monthly cars data
        setMonthlyCars(monthlyRes?.data);
        console.log("hehe======>", monthlyRes?.data);
        
        // Log after setting state - this will capture the next state value
        setTimeout(() => console.log('monthlyCars state after update:', monthlyCars), 0);
        
        // Set cashflows data
        setCashflows(cashflowRes.data);

        // Calculate cashflow summary and category breakdown
        const cashflowData = cashflowRes.data;
        setCategoryBreakdown(getCategoryTotals(cashflowData));

        // Calculate today's cashflow summary
        const dailyEntries = dailyCashflowRes.data && dailyCashflowRes.data.entries 
          ? dailyCashflowRes.data.entries 
          : [];
        
        const todayCashIn = dailyEntries
          .filter(cf => cf.type === 'cash-in')
          .reduce((sum, cf) => sum + cf.amount, 0);
          
        const todayCashOut = dailyEntries
          .filter(cf => cf.type === 'cash-out')
          .reduce((sum, cf) => sum + cf.amount, 0);
          
        setTodayCashflow({
          cashIn: todayCashIn,
          cashOut: todayCashOut,
          balance: todayCashIn - todayCashOut
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [today]); // Add today as dependency

  const getCategoryTotals = (data) => {
    const categories = {};
    
    data.forEach(cashflow => {
      if (!cashflow.category) return;
      
      const category = cashflow.category;
      const type = cashflow.type;
      const amount = cashflow.amount;
      
      if (!categories[category]) {
        categories[category] = {
          totalIn: 0,
          totalOut: 0
        };
      }
      
      if (type === 'cash-in') {
        categories[category].totalIn += amount;
      } else {
        categories[category].totalOut += amount;
      }
    });
    
    return Object.entries(categories)
      .map(([category, values]) => ({
        category,
        totalIn: values.totalIn,
        totalOut: values.totalOut,
        net: values.totalIn - values.totalOut
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  };
  
  // Helper function to get month name
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  const currentMonthName = getMonthName(monthlyCars?.currentMonth?.month);
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard <span className="urdu-text">/ مرکزی صفحہ</span></h1>
      </div>
      
      <div className="summary-cards">
        <SummaryCard 
          title={`Cars Bought (${currentMonthName})`}
          value={monthlyCars?.summary?.carsBoughtCount || 0} 
          icon={<FaShoppingCart />} 
          color="#4361ee" 
        />
        <SummaryCard 
          title={`Cars Sold (${currentMonthName})`}
          value={monthlyCars?.summary?.carsSoldCount || 0} 
          icon={<FaHandHoldingUsd />} 
          color="#3a0ca3" 
        />
        <SummaryCard 
          title="Inventory" 
          value={`${(monthlyCars?.inventoryStats?.currentInventory || 0)}`} 
          icon={<FaWarehouse />} 
          color="#f72585" 
        />
        <SummaryCard 
          title="Cars Sold till now" 
          value={monthlyCars?.inventoryStats?.totalCarsSold || 0} 
          icon={<FaChartLine />} 
          color="#7209b7" 
        />
      </div>
      
      <div className="dashboard-grid">
        {/* Add Car Section - Moved from Inventory */}
        <div className="add-car-container">
          <div className="card">
            <div className="card-header">
              <h2>Inventory <span className="urdu-text">/انوینٹری</span></h2>
            </div>
            <div className="card-body">
              <div className="add-buttons">
                <Link to="/car-form?type=bought" className="btn btn-primary">
                  <FaPlusCircle /> Add Car <span className="urdu-text">/ گاڑی شامل کریں</span>
                </Link>
              </div>
              <div className="quick-links">
                <Link to="/inventory" className="btn btn-outline">
                  <FaCar /> View Inventory <span className="urdu-text">/ انوینٹری دیکھیں</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

          {/* Cash Summary Section - Similar to CashflowDashboard */}
          <div className="cashflow-summary-container">
          <div className="card">
            <div className="card-header">
              <h2>Today's Cashflow Summary <span className="urdu-text">/ آج کا نقد بہاؤ خلاصہ</span></h2>
            </div>
            <div className="card-body">
              <div className="cashflow-summary">
                <div className="summary-card cash-in">
                  <h3>Total Cash In: </h3>
                  <h3 className="amount">${todayCashflow.cashIn.toLocaleString()}</h3>
                </div>
                <div className="summary-card cash-out">
                  <h3>Total Cash Out: </h3>
                  <h3 className="amount">${todayCashflow.cashOut.toLocaleString()}</h3>
                </div>
                <div className={`summary-card balance ${todayCashflow.balance >= 0 ? 'positive' : 'negative'}`}>
                  <h3>Balance: </h3>
                  <h3 className="amount">${todayCashflow.balance.toLocaleString()}</h3>
                </div>
              </div>
              <div className="cashflow-actions">
                <Link to="/add-cash-in" className="btn btn-success">
                  <FaArrowUp /> Add Cash Entry
                </Link>
                <Link to="/cashflow" className="btn btn-primary">
                  <FaMoneyBillWave /> View All Cashflow
                </Link>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;