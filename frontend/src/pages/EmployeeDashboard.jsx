import api from '../api/axiosConfig'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { logout } from '../utils/logout'
import './EmployeeDashboard.css'

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