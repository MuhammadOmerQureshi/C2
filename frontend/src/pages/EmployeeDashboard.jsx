import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { logout } from '../utils/logout';
import './EmployeeDashboard.css'; // Keep HEAD's styling
import '../styles/elements.css'; // Include newObada's additional styles if compatible

// Placeholder for Table component (adapt based on your actual Table component)
const Table = ({ data, onClockIn, onClockOut, loading, error }) => (
  <div className="bg-white p-4 rounded shadow mb-6">
    {error && <div className="text-red-600 mb-2">{error}</div>}
    {loading ? (
      <p>Loading…</p>
    ) : data.length === 0 ? (
      <p>No records found.</p>
    ) : (
      <table className="attendance-table w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r._id}>
              <td>{new Date(r.date).toLocaleDateString()}</td>
              <td>{r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : '—'}</td>
              <td>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : '—'}</td>
              <td>{r.status}</td>
              <td>
                {!r.clockOut && (
                  <button
                    onClick={() => onClockOut(r._id)}
                    className="bg-blue-500 text-white py-1 px-2 rounded"
                  >
                    Clock Out
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

// Placeholder for Clock component (adapt based on your actual Clock component)
const ShiftList = ({ shifts, onClockIn, loading, error }) => (
  <div className="bg-white p-4 rounded shadow mb-6">
    <h2 className="text-xl font-semibold mb-2">Your Shifts</h2>
    {error && <div className="text-red-600 mb-2">{error}</div>}
    {loading ? (
      <p>Loading shifts…</p>
    ) : shifts.length === 0 ? (
      <p>No shifts assigned.</p>
    ) : (
      <ul className="shift-list">
        {shifts.map((s) => (
          <li key={s._id} className="shift-item flex justify-between py-2">
            <div>
              <strong>{new Date(s.date).toLocaleDateString()}</strong>{' '}
              {s.startTime}–{s.endTime}
            </div>
            <div>
              {s.status === 'scheduled' ? (
                <button
                  onClick={() => onClockIn(s._id)}
                  className="bg-blue-500 text-white py-1 px-2 rounded"
                >
                  Clock In
                </button>
              ) : (
                <span>Status: {s.status}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default function EmployeeDashboard() {
  const [shifts, setShifts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
    fetchHistory();
  }, []);

  async function fetchShifts() {
    setLoadingShifts(true);
    try {
      const res = await api.get('/shifts/my/shifts');
      setShifts(res.data);
    } catch (err) {
      setError('Failed to load shifts');
    }
    setLoadingShifts(false);
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const res = await api.get('/attendance/my-history');
      setHistory(res.data);
    } catch {
      setError('Failed to load attendance history');
    }
    setLoadingHistory(false);
  }

  async function handleClockIn(shiftId) {
    setError('');
    try {
      await api.post('/attendance/clock-in', { shiftId });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-in failed');
    }
  }

  async function handleClockOut(recordId) {
    setError('');
    try {
      await api.post('/attendance/clock-out', { attendanceId: recordId });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-out failed');
    }
  }

  return (
    <div className="employee-dashboard min-h-screen bg-gray-100 p-6">
      <header className="dashboard-header flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <button
          onClick={() => logout(navigate)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </header>

      <ShiftList
        shifts={shifts}
        onClockIn={handleClockIn}
        loading={loadingShifts}
        error={error}
      />

      <Table
        data={history}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        loading={loadingHistory}
        error={error}
      />
    </div>
  );
}