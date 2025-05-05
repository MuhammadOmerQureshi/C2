import React from 'react';

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Employee Dashboard</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Your Shifts</h2>
        {/* TODO: Add shift details */}
        <p>Shift details will be displayed here.</p>
      </div>
      <div className="mt-6">
        <button className="bg-blue-500 text-white py-2 px-4 rounded">
          Clock In
        </button>
        <button className="bg-red-500 text-white py-2 px-4 rounded ml-4">
          Clock Out
        </button>
      </div>
    </div>
  );
}
