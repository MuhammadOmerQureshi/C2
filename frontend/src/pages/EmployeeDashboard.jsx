import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { logout } from '../utils/logout';
import SpinningLogo from '../components/SpinningLogo';
import '../styles/pages/employeeDashboard.css';

export default function EmployeeDashboard() {
  const [shifts, setShifts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  // Derived stats for overview and analytics
  const upcomingShifts = shifts.filter(s => s.status === 'scheduled').length;
  const totalHours = history.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const attendanceCount = history.length;
  const onTimeCount = history.filter(r => r.status === 'On Time').length;
  const lateCount = history.filter(r => r.status === 'Late').length;
  const absentCount = history.filter(r => r.status === 'Absent').length;
  const attendancePercent = attendanceCount ? Math.round((onTimeCount / attendanceCount) * 100) : 0;

  useEffect(() => {
    fetchShifts();
    fetchHistory();
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  async function fetchShifts() {
    setLoadingShifts(true);
    try {
      const res = await api.get('/shifts/my');
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
    } catch (err) {
      setError('Failed to load attendance history');
    }
    setLoadingHistory(false);
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data);
    } catch (err) {
      // ignore
    }
  }

  async function handleClockIn(shiftId) {
    setError('');
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await api.post('/attendance/clock-in', { shiftId, ip });
      alert(res.data.message);  // Shows "IP validation successful" or error
      fetchHistory();
      fetchShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-in failed');
    }
  }

  async function handleClockOut(recordId) {
    setError('');
    try {
      await api.post('/attendance/clock-out', { attendanceId: recordId });
      fetchHistory();
      fetchShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-out failed');
    }
  }

  

  // Export attendance PDF for the logged-in employee
  async function exportPDF() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Please log in again.');
        return;
      }
      // Use the logged-in employee's ID from profile
      const employeeId = profile._id || profile.id;
      if (!employeeId) {
        alert('Could not determine your employee ID.');
        return;
      }
      const url = `/api/attendance/export/pdf?employeeId=${employeeId}&ts=${Date.now()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check for HTML response (error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        alert('Export failed: ' + text);
        return;
      }

      if (!response.ok) {
        let errorMsg = 'Export failed';
        if (response.status === 401 || response.status === 403) {
          errorMsg = 'Unauthorized. Please log in again.';
        } else {
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch {
            errorMsg = response.statusText || errorMsg;
          }
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        alert('Export failed: The file is empty. You may not have permission or there is no data.');
        return;
      }
      let filename = 'attendance.pdf';
      const disposition = response.headers.get('content-disposition');
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(err.message || 'Export failed');
    }
  }

  return (
    <>
      {/* ===== Header ===== */}
      <header className="header">
        <div className="header-logo-title">
          <img src="/logo.png" alt="CesiumClock Logo" className="spinning-logo"/>
          <span className="header-title">Employee Dashboard</span>
        </div>
        <button className="btn btn-logout" onClick={() => logout(navigate)}>
          Logout
        </button>
      </header>

      <main className="main-content">
        {/* ===== Overview Cards ===== */}
        <section className="overview">
          <div className="card">
            <h3>Upcoming Shifts</h3>
            <p className="stat-number">{upcomingShifts}</p>
          </div>
          <div className="card">
            <h3>Total Hours This Month</h3>
            <p className="stat-number">{totalHours.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Attendance %</h3>
            <p className="stat-number">{attendancePercent}%</p>
          </div>
        </section>

        <div className="dashboard-body">
          {/* LEFT: Shifts and Attendance */}
          <div className="dashboard-left">
            {/* Your Shifts */}
            <section className="section-block">
              <h2>Your Shifts</h2>
              <div className="shift-cards">
                {loadingShifts ? (
                  <p>Loading shifts…</p>
                ) : shifts.length === 0 ? (
                  <p>No shifts scheduled.</p>
                ) : (
                  shifts.map(shift => (
                    <div key={shift._id} className="shift-card">
                      <div>
                        <div className="shift-date">{shift.date ? new Date(shift.date).toLocaleDateString() : '—'}</div>
                        <div className="shift-time">{shift.startTime} – {shift.endTime}</div>
                      </div>
                      <div>
                        {shift.status === 'scheduled' ? (
                          <button className="btn btn-primary" onClick={() => handleClockIn(shift._id)}>
                            Clock In
                          </button>
                        ) : (
                          <button className="btn btn-primary" disabled>
                            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Attendance History */}
            <section className="section-block">
              <h2>Attendance History</h2>
              <div className="table-scrollable">
                <table className="data-table">
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
                    {loadingHistory ? (
                      <tr><td colSpan={6}>Loading history…</td></tr>
                    ) : history.length === 0 ? (
                      <tr><td colSpan={6}>No records found.</td></tr>
                    ) : (
                      history.map(r => (
                        <tr key={r._id}>
                          <td>
                            {r.date && !isNaN(new Date(r.date))
                              ? new Date(r.date).toLocaleDateString()
                              : '—'}
                          </td>
                          <td>
                            {r.clockIn && !isNaN(new Date(r.clockIn))
                              ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </td>
                          <td>
                            {r.clockOut && !isNaN(new Date(r.clockOut))
                              ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </td>
                          <td>{r.status || '—'}</td>
                          <td>{r.hoursWorked != null ? r.hoursWorked.toFixed(2) : '—'}</td>
                          <td>
                            {!r.clockOut && (
                              <button className="btn btn-sm btn-primary" onClick={() => handleClockOut(r._id)}>
                                Clock Out
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-actions">
                
                <button className="btn btn-secondary" onClick={exportPDF}>Export PDF</button>
              </div>
            </section>
          </div>

          {/* RIGHT: Analytics, Profile */}
          <aside className="dashboard-right">
            <div className="analytics-card">
              <h2>Attendance Summary</h2>
              <ul>
                <li>On Time: <b>{onTimeCount}</b></li>
                <li>Late: <b>{lateCount}</b></li>
                <li>Absent: <b>{absentCount}</b></li>
              </ul>
            </div>
            <div className="analytics-card">
              <h2>Your Profile</h2>
              <div className="profile-block">
                <div><b>Name:</b> {profile.firstName} {profile.lastName}</div>
                <div><b>Email:</b> {profile.email}</div>
                <div><b>Employee #:</b> {profile.employeeId}</div>
                <div><b>Contact:</b> {profile.contactNumber}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Team &amp; Careers</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Developer Hub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Policies</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Settings</a></li>
            </ul>
          </div>
<div className="social-icons">
  <a href="https://www.facebook.com/" aria-label="Facebook" className="social-icon-box" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" />
  </a>
  <a href="https://x.com/" aria-label="Twitter" className="social-icon-box" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn.simpleicons.org/x/000000" alt="X" width="24" />
  </a>
  <a href="https://se.linkedin.com/" aria-label="LinkedIn" className="social-icon-box" target="_blank" rel="noopener noreferrer">
    <img src="/li.png" alt="LinkedIn" width="24" />
  </a>
  <a href="https://www.instagram.com/" aria-label="Instagram" className="social-icon-box" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" />
  </a>
</div>


        </div>
        <div className="footer-bottom">
          <p>© 2025 CesiumClock. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
