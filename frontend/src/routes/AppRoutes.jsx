import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage      from '../pages/LoginPage';
import EmployerDash   from '../pages/EmployerDashboard';
import EmployeeDash   from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LoginPage />} />
        <Route path="/employer"   element={<EmployerDash />} />
        <Route path="/employee"   element={<EmployeeDash />} />
        <Route path="/admin"      element={<AdminDashboard />} />

        


        {/* future routes */}
      </Routes>
    </BrowserRouter>
  );
}


