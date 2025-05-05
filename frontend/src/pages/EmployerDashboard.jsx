import React from 'react';

export default function EmployerDashboard() {
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
      </div>
    </div>
  );
}
