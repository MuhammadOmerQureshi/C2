
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import EmployerDash from './pages/EmployerDashboard';
import EmployeeDash from './pages/EmployeeDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employer" element={<EmployerDash />} />
        <Route path="/employee-dashboard" element={<EmployeeDash />} /> {/* Fix here */}
        {/* future routes */}
      </Routes>
    </BrowserRouter>
  );
}

/*

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
      </Routes>
    </Router>
  );
}
  */