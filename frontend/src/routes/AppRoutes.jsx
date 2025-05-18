import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import EmployerDash from "../pages/EmployerDashboard";
import EmployeeDash from "../pages/EmployeeDashboard";
/*import RegisterPage   from '../pages/RegisterPage';*/
import AdminDashboard from "../pages/AdminDashboard";
import EmployerIPSettings from '../components/EmployerIPSettings';
import FailedAttemptsLog from '../components/FailedAttemptsLog';
import EmployeeClockIn from '../components/EmployeeClockIn';
import IPRangeManager from '../components/IPRangeManager';
import ClockInOut from '../components/ClockInOut';
import ForgotPasswordPage from "../pages/ForgotPasswordPage"; // Import ForgotPasswordPage
import ResetPasswordPage from "../pages/ResetPasswordPage";   // Import ResetPasswordPage
import ContactUsPage from '../pages/ContactUsPage';
import AdminContactMessages from '../pages/AdminContactMessages';
import AboutPage from '../pages/AboutPage';
// import RequireAuth from '../components/RequireAuth';   // for future use

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employer" element={<EmployerDash />} />
        <Route path="/employee" element={<EmployeeDash />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Add route for ForgotPasswordPage */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* Add route for ResetPasswordPage */}
        <Route path="/employer/ip-settings" element={<EmployerIPSettings />} />
        <Route path="/employer/failed-attempts" element={<FailedAttemptsLog />} />
        <Route path="/employee/clock-in" element={<EmployeeClockIn />} />
        <Route path="/employer/ip-settings" element={<IPRangeManager />} />
        <Route path="/employee/attendance" element={<ClockInOut />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
        <Route path="/about" element={<AboutPage />} />

        {/* future routes */}
      </Routes>
    </BrowserRouter>
  );
}

