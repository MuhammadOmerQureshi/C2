import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { logout } from '../utils/logout';
import '../styles/pages/employer.css';
import SpinningLogo from '../components/SpinningLogo';


async function exportAttendancePDF(empId) {
  const token = localStorage.getItem('token');
  try {
    const res = await api.get(`/attendance/export/pdf?employeeId=${empId}`, {
      responseType: 'blob',
    });
    const blob = await res.data;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed');
  }
}

export default function EmployerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
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
  const navigate = useNavigate();
  const location = useLocation();
  const employerId = localStorage.getItem('userId');
  const dashboardRef = useRef(null);

  useEffect(() => {
    // Disable browser scroll restoration
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => {
        console.log('Scrolling to top');
        console.log('Zoom level:', window.devicePixelRatio * 100 + '%');
        window.scrollTo(0, 0);
        if (dashboardRef.current) {
          dashboardRef.current.scrollTop = 0;
          // Find and scroll any parent scrollable containers
          let parent = dashboardRef.current.parentElement;
          while (parent) {
            if (parent.scrollHeight > parent.clientHeight) {
              console.log('Found scrollable parent:', parent);
              parent.scrollTop = 0;
            }
            parent = parent.parentElement;
          }
        }
      });
    }
  }, [loading, location.pathname]);

  async function fetchAll() {
    setLoading(true);
    setError('');
    try {
      const [empRes, shiftRes] = await Promise.all([
        api.get(`/employees?employerId=${employerId}`),
        api.get(`/shifts?employerId=${employerId}`),
      ]);
      setEmployees(empRes.data);
      setShifts(shiftRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
    setLoading(false);
  }

  async function handleAddEmployee(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/employees', { ...empForm, employerId });
      setEmpForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        employeeId: '',
      });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
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

  return (
    <>
      <SpinningLogo />
      <div className="employer-dashboard" ref={dashboardRef}>
        <header className="dashboard-header">
          <h1>Employer Dashboard</h1>
          <button className="logout-btn" onClick={() => logout(navigate)}>
            Logout
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="add-section">
          <h2>Add Employee</h2>
          <form className="add-form" onSubmit={handleAddEmployee}>
            <input
              placeholder="First Name"
              value={empForm.firstName}
              onChange={(e) => setEmpForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              placeholder="Last Name"
              value={empForm.lastName}
              onChange={(e) => setEmpForm((f) => ({ ...f, lastName: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              placeholder="Username"
              value={empForm.username}
              onChange={(e) => setEmpForm((f) => ({ ...f, username: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              placeholder="Email"
              type="email"
              value={empForm.email}
              onChange={(e) => setEmpForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              placeholder="Password"
              type="password"
              value={empForm.password}
              onChange={(e) => setEmpForm((f) => ({ ...f, password: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              placeholder="Employee ID"
              value={empForm.employeeId}
              onChange={(e) => setEmpForm((f) => ({ ...f, employeeId: e.target.value }))}
              required
              autoFocus={false}
            />
            <button type="submit">Add</button>
          </form>
        </section>

        <section className="add-section">
          <h2>Add Shift</h2>
          <form className="add-form" onSubmit={handleAddShift}>
            <select
              value={shiftForm.employeeId}
              onChange={(e) => setShiftForm((f) => ({ ...f, employeeId: e.target.value }))}
              required
              autoFocus={false}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={shiftForm.date}
              onChange={(e) => setShiftForm((f) => ({ ...f, date: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              type="time"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm((f) => ({ ...f, startTime: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              type="time"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm((f) => ({ ...f, endTime: e.target.value }))}
              required
              autoFocus={false}
            />
            <input
              placeholder="Location"
              value={shiftForm.location}
              onChange={(e) => setShiftForm((f) => ({ ...f, location: e.target.value }))}
              required
              autoFocus={false}
            />
            <button type="submit">Add</button>
          </form>
        </section>

        <section className="list-section">
          <h2>Employees</h2>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Employee ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>{emp.username}</td>
                    <td>{emp.email}</td>
                    <td>{emp.employeeId}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteEmployee(emp._id)}
                      >
                        Delete
                      </button>

                      <button onClick={() => exportAttendancePDF(emp._id)}>
                        Export PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5}>No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        <section className="list-section">
          <h2>Shifts</h2>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift._id}>
                    <td>
                      {(() => {
                        const emp = employees.find(
                          (e) => e._id === (shift.employee?._id || shift.employee)
                        );
                        return emp
                          ? `${emp.firstName} ${emp.lastName}`
                          : shift.employee?._id || shift.employee;
                      })()}
                    </td>
                    <td>{new Date(shift.date).toLocaleDateString()}</td>
                    <td>{shift.startTime}</td>
                    <td>{shift.endTime}</td>
                    <td>{shift.location}</td>
                    <td>{shift.status}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteShift(shift._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={7}>No shifts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}