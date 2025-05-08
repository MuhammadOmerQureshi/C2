import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';


export default function EmployerDashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Employer Dashboard</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Manage Employees</h2>
        {/* TODO: Add employee management features */}
        <p>Employee management tools will be displayed here.</p>
      </div>
      <div className="mt-6">
        <button className="bg-green-500 text-white py-2 px-4 rounded">
          Add Employee
        </button>
        <button className="bg-blue-500 text-white py-2 px-4 rounded ml-4">
          View Reports
        </button>
        <button
        onClick={() => logout(navigate)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
+        Logout
+      </button>
      </div>
    </div>
  );
}
