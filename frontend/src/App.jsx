import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { NavLink } from 'react-router-dom';

import './styles/index.css';

import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Clock from './components/Clock';

function App() {
  // You might have some authentication state here
  const userRole = 'employer'; // This should come from your auth system

  return (
    <>
      <nav className="main-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        
        {userRole === 'employer' && (
          <>
            <NavLink to="/employer/ip-settings">IP Settings</NavLink>
            <NavLink to="/employer/failed-attempts">Failed Attempts</NavLink>
          </>
        )}
        
        {userRole === 'employee' && (
          <NavLink to="/employee/clock-in">Clock In/Out</NavLink>
        )}
      </nav>
      
      <Clock />
      <AppRoutes />
    </>
  );
}

export default App;
