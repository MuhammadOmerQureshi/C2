import { Routes, Route } from 'react-router-dom';
import LoginPage      from '../pages/LoginPage';
import EmployerDash   from '../pages/EmployerDashboard';
import EmployeeDash   from '../pages/EmployeeDashboard';
/*import RegisterPage   from '../pages/RegisterPage';*/
import AdminDashboard from '../pages/AdminDashboard';
import EmployerIPSettings from '../components/EmployerIPSettings';
import FailedAttemptsLog from '../components/FailedAttemptsLog';
import EmployeeClockIn from '../components/EmployeeClockIn';
import IPRangeManager from '../components/IPRangeManager';
import ClockInOut from '../components/ClockInOut';
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<LoginPage />} />
      <Route path="/employer"   element={<EmployerDash />} />
      <Route path="/employee"   element={<EmployeeDash />} />
      <Route path="/admin"      element={<AdminDashboard />}/>
      <Route path="/employer/ip-settings" element={<EmployerIPSettings />} />
      <Route path="/employer/failed-attempts" element={<FailedAttemptsLog />} />
      <Route path="/employee/clock-in" element={<EmployeeClockIn />} />
      <Route path="/employer/ip-settings" element={<IPRangeManager />} />
      <Route path="/employee/attendance" element={<ClockInOut />} />

      {/* future routes */}
    </Routes>
  );
}
