import api from '../api/axiosConfig'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { logout } from '../utils/logout'
import './EmployeeDashboard.css'

export default function EmployeeDashboard() {
  const [shifts, setShifts] = useState([])
  const [history, setHistory] = useState([])
  const [employees, setEmployees] = useState([])
  const [loadingShifts, setLoadingShifts] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchShifts()
    fetchHistory()
    fetchEmployees()
  }, [])

  async function fetchShifts() {
    setLoadingShifts(true)
    try {
      const res = await api.get('/shifts/my/shifts')
      setShifts(res.data)
    } catch (err) {
      console.error('Error fetching shifts:', err)
      setError('Failed to load shifts')
    }
    setLoadingShifts(false)
  }

  async function fetchHistory() {
    setLoadingHistory(true)
    try {
      const res = await api.get('/attendance/my-history')
      setHistory(res.data)
    } catch {
      setError('Failed to load attendance history')
    }
    setLoadingHistory(false)
  }

  async function fetchEmployees() {
    try {
      const res = await api.get('/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Failed to load employees')
    }
  }

  async function handleClockIn(shiftId) {
    setError('')
    try {
      await api.post('/attendance/clock-in', { shiftId })
      fetchHistory()
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-in failed')
    }
  }

  async function handleClockOut(recordId) {
    setError('')
    try {
      await api.post('/attendance/clock-out', { attendanceId: recordId })
      fetchHistory()
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-out failed')
    }
  }

  return (
    <div className="employee-dashboard">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <button className="logout-btn" onClick={() => logout(navigate)}>
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="employees-section">
        <h1>Employees</h1>
        {employees.length > 0 ? (
          <ul>
            {employees.map((employee) => (
              <li key={employee._id}>
                {employee.firstName} {employee.lastName} - {employee.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No employees found.</p>
        )}
      </section>

      <section className="shifts-section">
        <h1>Shifts</h1>
        {shifts.length > 0 ? (
          <ul>
            {shifts.map((shift) => (
              <li key={shift._id}>
                {shift.date} - {shift.startTime} to {shift.endTime}
              </li>
            ))}
          </ul>
        ) : (
          <p>No shifts found.</p>
        )}
      </section>

      <section className="shifts-section">
        <h2>Your Shifts</h2>
        {loadingShifts
          ? <p>Loading shifts…</p>
          : shifts.length === 0
            ? <p>No shifts assigned.</p>
            : (
              <ul className="shift-list">
                {shifts.map(s => (
                  <li key={s._id} className="shift-item">
                    <div>
                      <strong>{new Date(s.date).toLocaleDateString()}</strong>
                      {' '}{s.startTime}–{s.endTime}
                    </div>
                    <div className="shift-actions">
                      {s.status === 'scheduled'
                        ? <button onClick={() => handleClockIn(s._id)}>
                            Clock In
                          </button>
                        : <span>Status: {s.status}</span>
                      }
                    </div>
                  </li>
                ))}
              </ul>
            )
        }
      </section>

      <section className="attendance-section">
        <h2>Attendance History</h2>
        {loadingHistory
          ? <p>Loading history…</p>
          : history.length === 0
            ? <p>No records found.</p>
            : (
              <table className="attendance-table">
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
                  {history.map(r => (
                    <tr key={r._id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>
                        {r.clockIn
                          ? new Date(r.clockIn).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td>
                        {r.clockOut
                          ? new Date(r.clockOut).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td>{r.status}</td>
                      <td>
                        {!r.clockOut &&
                          <button onClick={() => handleClockOut(r._id)}>
                            Clock Out
                          </button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </section>
    </div>
  )
}
