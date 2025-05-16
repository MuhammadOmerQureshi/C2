<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import EmployerDash from "../pages/EmployerDashboard";
import EmployeeDash from "../pages/EmployeeDashboard";
/*import RegisterPage   from '../pages/RegisterPage';*/
import AdminDashboard from "../pages/AdminDashboard";
import ForgotPasswordPage from "../pages/ForgotPasswordPage"; // Import ForgotPasswordPage
import ResetPasswordPage from "../pages/ResetPasswordPage";   // Import ResetPasswordPage
// import RequireAuth from '../components/RequireAuth';   // for future use

=======
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage      from '../pages/LoginPage';
import EmployerDash   from '../pages/EmployerDashboard';
import EmployeeDash   from '../pages/EmployeeDashboard';
/*import RegisterPage   from '../pages/RegisterPage';*/
import AdminDashboard from '../pages/AdminDashboard';
// import RequireAuth from '../components/RequireAuth';   // for future use


// import { useAuth } from '../hooks/useAuth'; // for future use  
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<LoginPage />} />
        <Route path="/employer" element={<EmployerDash />} />
        <Route path="/employee" element={<EmployeeDash />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Add route for ForgotPasswordPage */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* Add route for ResetPasswordPage */}
=======
        <Route path="/"           element={<LoginPage />} />
        <Route path="/employer"   element={<EmployerDash />} />
        <Route path="/employee"   element={<EmployeeDash />} />
        <Route path="/admin"      element={<AdminDashboard />}/>
         
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61

        {/* future routes */}
      </Routes>
    </BrowserRouter>
  );
}

<<<<<<< HEAD
=======

>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
