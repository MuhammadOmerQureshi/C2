import React from 'react';
import Clock from '../components/clock'; // Import the Clock component
import Table from '../components/table'; // Import the Table component
import '../styles/Home_screen_style.css'; // Import styles
import '../styles/elements.css'; // Import additional styles

export default function EmployeeDashboard() {
  // Handle table exit logic
  const handleTableExit = () => {
    console.log("Table exit button clicked");
  };

  return (
    <div className="min-h-screen bg-red-100 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-4">Employee Dashboard</h1>

      {/* Table Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Shifts</h2>
        <Table
          tableVisible={true}
          setTableVisible={() => {}}
          showTableOnMobile={false}
          setShowTableOnMobile={() => {}}
          find_cookie={() => ""}
          workSessions={[]}
        />
        <button
          id="table_exit_button"
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          onClick={handleTableExit}
        >
          Exit Table
        </button>
      </div>

      {/* Clock Section */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Clock Component</h2>
        <Clock
          start_time=""
          set_start_time={() => {}}
          end_time=""
          set_end_time={() => {}}
          offset_from_start={0}
          set_circle_offset={() => {}}
        />
      </div>
    </div>
  );
}