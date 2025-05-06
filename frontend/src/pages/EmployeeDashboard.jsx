import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';


export default function EmployeeDashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Employee Dashboard</h1>
      <button
        onClick={() => logout(navigate)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
+        Logout
+      </button>



      {/* TODO: show shift, clock-in/out button */}
    </div>
  );
}
