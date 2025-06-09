import { useState } from 'react'      
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useEffect } from 'react';

import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
// import './styles/index.css';
import Clock from './components/Clock';
// import Footer from './components/Footer';
import LanguageSelector from './components/LanguageSelector';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  // Example: get userRole from auth context or state
  // const userRole = useAuth()?.role;
  const userRole = null; // null means not logged in

//   const location = useLocation();
//   const isLoginPage = location.pathname === '/';

  return (
    <>
      {/* Only show nav if not on login page and user is logged in */}
      {/* {!isLoginPage && userRole && ( */}
      {userRole && (

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
      )}

      <LanguageSelector />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* ...other routes... */}
      </Routes>

      {/* Only show clock and footer if not on login page
      {!isLoginPage && ( */}
        <>
          <Clock />
          
        </>
      
    </>
  );
}

export default App;

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

// import './styles/index.css';

// import React from 'react';
// import AppRoutes from './routes/AppRoutes';
// import Clock from './components/Clock';

// function App() {
//   return (
//     <>
//       <Clock />
//       <AppRoutes />
//     </>
//   );
// }

// export default App;








