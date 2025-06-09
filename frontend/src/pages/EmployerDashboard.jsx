import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { logout } from '../utils/logout';

import '../styles/pages/employerDashboard.css';
import SpinningLogo from '../components/SpinningLogo';
import Chatbot from '../components/Chatbot';

// -- DEFENSIVE HOOK --
function useEmployerApiEmployees() {
  const [apiEmployees, setApiEmployees] = useState([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/employer/employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApiEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setApiEmployees([]); // Always array
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);
  return apiEmployees;
}

// Additional logout handler for /api/employer/logout endpoint
async function handleEmployerApiLogout(navigate) {
  try {
    const token = localStorage.getItem('token');
    await axios.post('/api/employer/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem('token');
    navigate('/login');
  } catch (err) {
    console.error(err);
  }
}

async function exportAttendancePDF(employeeId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
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
      alert('Export failed (employer dash 1)): ' + text);
      return;
    }

    if (!response.ok) {
      let errorMsg = 'Export failed (employer dash 2)';
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
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.response?.data?.message || 'Export failed');
  }
}

async function sendShiftReminder(shiftId, email) {
  try {
    const token = localStorage.getItem('token'); 
    const response = await fetch('http://localhost:5000/api/attendance/send-shift-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shiftId, email }),
    });

    if (response.ok) {
      alert('Shift reminder sent successfully!');
    } else {
      const error = await response.json();
      alert(`Failed to send reminder: ${error.message}`);
    }
  } catch (err) {
    console.error('Error sending shift reminder:', err);
    alert('An error occurred while sending the reminder.');
  }
}

export default function EmployerDashboard() {
  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [empForm, setEmpForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    employeeId: '',
  });
  const [shiftForm, setShiftForm] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();
  const employerId = localStorage.getItem('userId'); // Should be MongoDB _id

  const apiEmployees = useEmployerApiEmployees();

  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError('');
    try {
      const [empRes, shiftRes] = await Promise.all([
        api.get('/employees'), // Removed ?employerId=...
        api.get('/shifts'),    // Removed ?employerId=...
      ]);
      setEmployees(empRes.data);
      setShifts(shiftRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
    setLoading(false);
  }

  async function fetchAttendanceForChart(empId) {
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        logout(navigate);
        return;
      }
      const employeeExists = employees.some(emp => emp._id === empId);
      if (!employeeExists) {
        setError('Employee not found.');
        setChartData(null);
        return;
      }
      // Fetch attendance records for chart
      const res = await api.get(`/attendance?employeeId=${empId}`);
      const attendance = res.data;
      // Map chart data
      const labels = attendance.map((record) =>
        record.date ? new Date(record.date).toLocaleDateString() : ''
      );
      const hoursWorked = attendance.map((record) => record.hoursWorked || 0);
      const statusCounts = attendance.reduce((acc, record) => {
        const label = record.status || 'Unknown';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {});

      setChartData({
        hours: {
          labels,
          datasets: [{
            label: 'Hours Worked',
            data: hoursWorked,
            backgroundColor: 'rgba(43, 63, 229, 0.8)',
            borderColor: 'rgba(43, 63, 229, 0.8)',
            borderRadius: 5,
          }],
        },
        status: {
          labels: Object.keys(statusCounts),
          datasets: [{
            label: 'Attendance Status',
            data: Object.values(statusCounts),
            backgroundColor: [
              'rgba(43, 63, 229, 0.8)',
              'rgba(250, 192, 19, 0.8)',
              'rgba(253, 135, 135, 0.8)',
            ],
            borderColor: [
              'rgba(43, 63, 229, 0.8)',
              'rgba(250, 192, 19, 0.8)',
              'rgba(253, 135, 135, 0.8)',
            ],
          }],
        },
      });
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Unauthorized access. Please log in again.');
        logout(navigate);
      } else if (err.response?.status === 404) {
        setError('No attendance data found for this employee.');
      } else {
        setError(err.response?.data?.message || 'Failed to load attendance data for charts');
      }
      setChartData(null);
    }
  }

  async function handleAddEmployee(e) {
    e.preventDefault();
    setError('');
    const employerId = localStorage.getItem('userId'); // This should be the MongoDB _id

    // Username validation
    if (!empForm.username || empForm.username.trim() === '') {
      setError('Username is required');
      return;
    }

    const employeeData = {
      ...empForm,
      employerId // Make sure this is the MongoDB _id
    };

    try {
      await api.post('/employees', employeeData);
      setEmpForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        employeeId: '',
      });
      fetchAll();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add employee');
    }
  }

  async function handleDeleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return;
    setError('');
    try {
      await api.delete(`/employees/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  }

  async function handleAddShift(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/shifts', { ...shiftForm, employerId });
      setShiftForm({
        employeeId: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
      });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add shift');
    }
  }

  async function handleDeleteShift(id) {
    if (!window.confirm('Delete this shift?')) return;
    setError('');
    try {
      await api.delete(`/shifts/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete shift');
    }
  }

  function setTestChartData() {
    setChartData({
      hours: {
        labels: ['2024-05-01', '2024-05-02', '2024-05-03'],
        datasets: [{
          label: 'Hours Worked',
          data: [8, 7, 9],
          backgroundColor: 'rgba(43, 63, 229, 0.8)',
          borderColor: 'rgba(43, 63, 229, 0.8)',
          borderRadius: 5,
        }],
      },
      status: {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [{
          label: 'Attendance Status',
          data: [2, 1, 0],
          backgroundColor: [
            'rgba(43, 63, 229, 0.8)',
            'rgba(250, 192, 19, 0.8)',
            'rgba(253, 135, 135, 0.8)',
          ],
          borderColor: [
            'rgba(43, 63, 229, 0.8)',
            'rgba(250, 192, 19, 0.8)',
            'rgba(253, 135, 135, 0.8)',
          ],
        }],
      },
    });
  }

  // Example: Calculate pending clock-ins (adjust as needed)
  const pendingClockIns = employees.filter(e => !e.clockedIn).length;

  return (
    <>
      <SpinningLogo />

      {/* ===== Header ===== */}
      <header className="header">
        <h1 className="header-title">Employer Dashboard</h1>
        <button className="btn btn-logout" onClick={() => logout(navigate)}>
          Logout
        </button>
      </header>

      {/* ===== Notifications ===== */}
      <div className="notifications">
        <p>
          <strong>⚠️ Pending Clock-Ins:</strong> {pendingClockIns} employees have not clocked in yet.
        </p>
        <p>
          <strong>📢 Alert:</strong> {shifts.find(s => !s.employeeId) ? "Some shifts need assignment." : "All shifts assigned."}
        </p>
      </div>
    {/* <div class="dashboard-flex-layout"> */}
      <main className="main-content">
        {/* ===== Overview Cards ===== */}
        <section className="overview">
          <div className="card">
            <h3>Total Employees</h3>
            <p className="stat-number">{employees.length}</p>
          </div>
          <div className="card">
            <h3>Total Shifts Posted</h3>
            <p className="stat-number">{shifts.length}</p>
          </div>
          <div className="card">
            <h3>Pending Clock-Ins</h3>
            <p className="stat-number">{pendingClockIns}</p>
          </div>
        </section>

        {/* ===== Forms Section ===== */}
        <section className="forms">
          {/* Create Employee Form */}
          <div className="form-card">
            <h2>Create Employee</h2>
            <form className="create-form" onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label>First Name<span className="required">*</span></label>
                <input value={empForm.firstName} onChange={e => setEmpForm(f => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Last Name<span className="required">*</span></label>
                <input value={empForm.lastName} onChange={e => setEmpForm(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email<span className="required">*</span></label>
                <input type="email" value={empForm.email} onChange={e => setEmpForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Employee Number<span className="required">*</span></label>
                <input value={empForm.employeeId} onChange={e => setEmpForm(f => ({ ...f, employeeId: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Contact Number<span className="required">*</span></label>
                <input value={empForm.contactNumber || ''} onChange={e => setEmpForm(f => ({ ...f, contactNumber: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Password<span className="required">*</span></label>
                <input type="password" value={empForm.password} onChange={e => setEmpForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary">Create Employee</button>
            </form>
          </div>

          {/* Create/Edit Shift Form */}
          <div className="form-card">
            <h2>Create / Edit Shift</h2>
            <form className="create-form" onSubmit={handleAddShift}>
              <div className="form-group">
                <label>Date<span className="required">*</span></label>
                <input type="date" value={shiftForm.date} onChange={e => setShiftForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Start Time<span className="required">*</span></label>
                <input type="time" value={shiftForm.startTime} onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>End Time<span className="required">*</span></label>
                <input type="time" value={shiftForm.endTime} onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Role / Position<span className="required">*</span></label>
                <input value={shiftForm.role || ''} onChange={e => setShiftForm(f => ({ ...f, role: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary">Save Shift</button>
            </form>
          </div>
        </section>

        {/* ===== Tables Section ===== */}
        <section className="tables">
          {/* Employees Table */}
          <div className="table-card">
            <h2>Employees</h2>
            <div className="table-scrollable">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee #</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.employeeId}</td>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.contactNumber}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary">Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEmployee(emp._id)}>Delete</button>
                        <button className="btn btn-sm btn-export" onClick={() => exportAttendancePDF(emp._id)}>Export Attendance</button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan={5}>No employees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shifts Table */}
          <div className="table-card">
            <h2>Posted Shifts</h2>
            <div className="table-scrollable">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shift ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(shift => (
                    <tr key={shift._id}>
                      <td>{shift._id}</td>
                      <td>{shift.date ? new Date(shift.date).toLocaleDateString() : ''}</td>
                      <td>{shift.startTime} – {shift.endTime}</td>
                      <td>{shift.role}</td>
                      <td>{shift.status}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary">Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteShift(shift._id)}>Cancel</button>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr><td colSpan={6}>No shifts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    {/* <aside class="charts-area">


        


    </aside> */}

    {/* </div> */}

    
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
          <div className="footer-section social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook" className="icon-facebook">F</a>
              <a href="#" aria-label="Twitter" className="icon-twitter">T</a>
              <a href="#" aria-label="LinkedIn" className="icon-linkedin">L</a>
              <a href="#" aria-label="Instagram" className="icon-instagram">I</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 Your Company Name. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
