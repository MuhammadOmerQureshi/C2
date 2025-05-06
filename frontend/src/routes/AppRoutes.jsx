import { BrowserRouter, Routes, Route } from 'react-router-dom';


import AdminLayout from '../layouts/AdminLayout';
import EmployerLayout from '../layouts/EmployerLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import LoginLayout from '../layouts/LoginLayout';



import AdminDashboard from '../pages/AdminDashboard';
import LoginPage      from '../pages/LoginPage';
import EmployerDashboard   from '../pages/EmployerDashboard';  
import EmployeeDashboard   from '../pages/EmployeeDashboard';
/*import RegisterPage   from '../pages/RegisterPage';*/

// import RequireAuth from '../components/RequireAuth';   // for future use





export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <LoginLayout>
            {(modalProps) => <LoginPage {...modalProps} />}
          </LoginLayout>
        } />
        <Route path="/employer" element={
          <EmployerLayout>
            {(modalProps) => <EmployerDashboard {...modalProps} />}
          </EmployerLayout>
        } />
        <Route path="/employee" element={
          <EmployeeLayout>
            {(modalProps) => <EmployeeDashboard {...modalProps} />}
          </EmployeeLayout>
        } />
        <Route path="/admin" element={
          <AdminLayout>
            {(modalProps) => <AdminDashboard {...modalProps} />}
          </AdminLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}



