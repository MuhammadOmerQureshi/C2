import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { logout } from '../utils/logout';
import SpinningLogo from '../components/SpinningLogo';
import '../styles/pages/employee.css';

export default function EmployeeDashboard() {
  const [shifts, setShifts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Use userId instead of employerId

  useEffect(() => {
    fetchShifts();
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  async function fetchShifts() {
    setLoadingShifts(true);
    try {
      // Remove the query parameter - let the backend use the JWT token
      const res = await api.get('/shifts/my');
      setShifts(res.data);
    } catch (err) {
      setError('Failed to load shifts');
      console.error('Shift fetch error:', err);
    }
    setLoadingShifts(false);
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      // Remove the query parameter - let the backend use the JWT token
      const res = await api.get('/attendance/my-history');
      setHistory(res.data);
    } catch (err) {
      setError('Failed to load attendance history');
      console.error('History fetch error:', err);
    }
    setLoadingHistory(false);

// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../api/axiosConfig'
// import { logout } from '../utils/logout'
// import SpinningLogo from '../components/SpinningLogo';
// import '../styles/pages/employer.css'

// export default function EmployeeDashboard() {
//   const [shifts, setShifts] = useState([])
//   const [history, setHistory] = useState([])
//   const [loadingShifts, setLoadingShifts] = useState(true)
//   const [loadingHistory, setLoadingHistory] = useState(true)
//   const [error, setError] = useState('')
//   const [ip, setIp] = useState('');
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetch('https://api.ipify.org?format=json')
//       .then(res => res.json())
//       .then(data => setIp(data.ip));
//   }, []);

//   useEffect(() => {
//     fetchShifts()
//     fetchHistory()
//   }, [])

//   async function fetchShifts() {
//     setLoadingShifts(true)
//     try {
//       const res = await api.get('/shifts/my')
//       setShifts(res.data)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to load shifts')
//     }
//     setLoadingShifts(false)
//   }

//   async function fetchHistory() {
//     setLoadingHistory(true)
//     try {
//       const res = await api.get('/attendance/my-history')
//       setHistory(res.data)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to load attendance history')
//     }
//     setLoadingHistory(false)
  }

  async function handleClockIn(shiftId) {
    setError('');
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json' );
      const { ip } = await ipRes.json();
      // Remove employerId from the request body
      const res = await api.post('/attendance/clock-in', { shiftId, ip });
      alert(res.data.message);
      
      // // Send shiftId and ip to backend
      // const res = await api.post('/attendance/clock-in', { shiftId, ip });
      // console.log('Backend response:', res.data); // Add this for debugging
      // alert(res.data.message); // This should show "Yahoo" or "very sad"

      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-in failed');
    }
  }

  async function handleClockOut(recordId) {
    setError('');
    try {
      // Remove employerId from the request body
      await api.post('/attendance/clock-out', { attendanceId: recordId });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-out failed');
    }
  }

  // Rest of the component remains the same
  return (
    <>
      <div className="employee-dashboard-bg">
        <div className="employee-dashboard-container">
          <header className="dashboard-header">
            <div className="dashboard-logo-title">
              <SpinningLogo />
              <h1>Employee Dashboard</h1>
            </div>
            <button className="logout-btn" onClick={() => logout(navigate)}>
              Logout
            </button>
          </header>

          {error && <div className="error-message">{error}</div>}

          <section className="shifts-section">
            <h2>Your Shifts</h2>
            {loadingShifts ? (
              <p>Loading shifts…</p>
            ) : shifts.length === 0 ? (
              <p>No shifts scheduled.</p>
            ) : (
              <div className="shift-cards">
                {shifts.map(shift => (
                  <div key={shift._id} className="shift-card">
                    <div>
                      <div className="shift-date">
                        {new Date(shift.date).toLocaleDateString()}
                      </div>
                      <div className="shift-time">
                        {shift.startTime} – {shift.endTime}
                      </div>
                    </div>
                    <div className="shift-actions">
                      {shift.status === 'scheduled' ? (
                        <button onClick={() => handleClockIn(shift._id)}>
                          Clock In
                        </button>
                      ) : (
                        <span className="shift-status">Status: {shift.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="attendance-section">
            <h2>Attendance History</h2>
            <div className="attendance-table-wrapper">
              {loadingHistory ? (
                <p>Loading history…</p>
              ) : history.length === 0 ? (
                <p>No records found.</p>
              ) : (
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Status</th>
                      <th>Hours Worked</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r._id}>
                        <td>
                          {r.date && !isNaN(new Date(r.date)) 
                            ? new Date(r.date).toLocaleDateString() 
                            : '—'}
                        </td>
                        <td>
                          {r.clockIn && !isNaN(new Date(r.clockIn))
                            ? new Date(r.clockIn).toLocaleTimeString()
                            : '—'}
                        </td>
                        <td>
                          {r.clockOut && !isNaN(new Date(r.clockOut))
                            ? new Date(r.clockOut).toLocaleTimeString()
                            : '—'}
                        </td>
                        <td>
                          {r.status || '—'}
                        </td>
                        <td>
                          {r.hoursWorked != null ? r.hoursWorked : '—'}
                        </td>
                        <td>
                          {!r.clockOut && (
                            <button onClick={() => handleClockOut(r._id)}>
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
          </section>
        </div>
      </div>
    </>
  );
}
