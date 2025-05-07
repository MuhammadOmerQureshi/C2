import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import EmployerDash from '../pages/EmployerDashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard'; // Fix import name

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employer" element={<EmployerDash />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> {/* Fix route */}
      </Routes>
    </BrowserRouter>
  );
}