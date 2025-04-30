import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage      from '../pages/LoginPage';
import EmployerDash   from '../pages/EmployerDashboard';
import EmployeeDash   from '../pages/EmployeeDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LoginPage />} />
        <Route path="/employer"   element={<EmployerDash />} />
        <Route path="/employee"   element={<EmployeeDash />} />
        {/* future routes */}
      </Routes>
    </BrowserRouter>
  );
}
