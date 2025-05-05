import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage      from '../pages/LoginPage';
import EmployerDash   from '../pages/EmployerDashboard';
import EmployeeDash   from '../pages/EmployeeDashboard';
import RegisterPage   from '../pages/RegisterPage';


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LoginPage />} />
        <Route path="/employer"   element={<EmployerDash />} />
        <Route path="/employee"   element={<EmployeeDash />} />
        <Route path="/register"   element={<RegisterPage />} />

        {/* future routes */}
      </Routes>
    </BrowserRouter>
  );
}


