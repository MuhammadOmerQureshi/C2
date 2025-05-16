<<<<<<< HEAD
import api from '../api/axiosConfig';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';
import '../styles/pages/employer.css';
import SpinningLogo from '../components/SpinningLogo';
import Chatbot from '../components/Chatbot';

async function exportAttendanceExcel(empId) {
  const token = localStorage.getItem('token'); 
  try {
    const res = await fetch(
      `http://localhost:5173/api/attendance/export/excel?employeeId=${empId}`,
     {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    if (!res.ok) {
      alert('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.response?.data?.message || 'Export failed');
  }
}

async function exportAttendancePDF(empId) {
  const token = localStorage.getItem('token'); // or wherever you store your JWT
  try {
    const res = await fetch(
      `http://localhost:5173/api/attendance/export/pdf?employeeId=${empId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    if (!res.ok) {
      alert('Export failed');
      return;
    }
    const blob = await res.blob();
=======
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, defaults } from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../api/axiosConfig';
import { logout } from '../utils/logout';
import '../styles/pages/employer.css';
import SpinningLogo from '../components/SpinningLogo';

// Configure Chart.js defaults
defaults.maintainAspectRatio = false;
defaults.responsive = true;
defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

async function exportAttendancePDF(empId) {
  try {
    const res = await api.get(`/attendance/export/pdf?employeeId=${empId}`, {
      responseType: 'blob',
    });
    const blob = res.data;
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
<<<<<<< HEAD
    alert(err.response?.data?.message || 'Export failed');
  }
}

async function exportAllAttendancePDF() {
  const token = localStorage.getItem('token'); // or wherever you store your JWT
  try {
    const res = await fetch('http://localhost:5173/api/attendance/export-all/pdf', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      alert('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_attendance.pdf';
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
    const token = localStorage.getItem('token'); // Use your authentication token
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
=======
    alert('Export failed: ' + (err.response?.data?.message || 'Unknown error'));
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
  }
}

export default function EmployerDashboard() {
<<<<<<< HEAD
  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [empForm, setEmpForm] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', employeeId: ''
  })
  const [shiftForm, setShiftForm] = useState({
    employeeId: '', date: '', startTime: '', endTime: '', location: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    setError('')
    try {
      const [empRes, shiftRes] = await Promise.all([
        api.get('/employees'),
        api.get('/shifts')
      ])
      setEmployees(empRes.data)
      setShifts(shiftRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    }
    setLoading(false)
  }

  async function handleAddEmployee(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/employees', empForm)
      setEmpForm({ firstName: '', lastName: '', username: '', email: '', password: '', employeeId: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee')
=======
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
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const employerId = localStorage.getItem('userId');
  const dashboardRef = useRef(null);

  useEffect(() => {
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
      // Validate employee ID
      const employeeExists = employees.some(emp => emp._id === empId);
      if (!employeeExists) {
        setError('Employee not found.');
        setChartData(null);
        return;
      }
      console.log('Fetching attendance for employee:', empId);
      const res = await api.get(`/attendance?employeeId=${empId}`);
      const attendance = res.data;
      console.log('Attendance data:', attendance);
      // Process attendance data for charts
      const labels = attendance.map((record) => new Date(record.date).toLocaleDateString());
      const hoursWorked = attendance.map((record) => record.hoursWorked || 0);
      const statusCounts = attendance.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
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
      console.error('Attendance fetch error:', err);
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
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
    }
  }

  async function handleDeleteEmployee(id) {
<<<<<<< HEAD
    if (!window.confirm('Delete this employee?')) return
    setError('')
    try {
      await api.delete(`/employees/${id}`)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee')
=======
    if (!window.confirm('Delete this employee?')) return;
    setError('');
    try {
      await api.delete(`/employees/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
    }
  }

  async function handleAddShift(e) {
<<<<<<< HEAD
    e.preventDefault()
    setError('')
    try {
      await api.post('/shifts', shiftForm)
      setShiftForm({ employeeId: '', date: '', startTime: '', endTime: '', location: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add shift')
=======
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
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
    }
  }

  async function handleDeleteShift(id) {
<<<<<<< HEAD
    if (!window.confirm('Delete this shift?')) return
    setError('')
    try {
      await api.delete(`/shifts/${id}`)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete shift')
    }
  }

  return (
    <>
      <SpinningLogo />
      <div className="employer-dashboard">
        <div className="dashboard-header">
          <header className="dashboard-header">
            <h1>Employer Dashboard</h1>
            <button className="logout-btn" onClick={() => logout(navigate)}>
              Logout
            </button>
          </header>
        </div>
        <div className="dashboard-scroll">
          {error && <div className="error-message">{error}</div>}

          <section className="add-section">
            <h2>Add Employee</h2>
            <form className="add-form" onSubmit={handleAddEmployee}>
              <input placeholder="First Name" value={empForm.firstName} onChange={e => setEmpForm(f => ({ ...f, firstName: e.target.value }))} required />
              <input placeholder="Last Name" value={empForm.lastName} onChange={e => setEmpForm(f => ({ ...f, lastName: e.target.value }))} required />
              <input placeholder="Username" value={empForm.username} onChange={e => setEmpForm(f => ({ ...f, username: e.target.value }))} required />
              <input placeholder="Email" type="email" value={empForm.email} onChange={e => setEmpForm(f => ({ ...f, email: e.target.value }))} required />
              <input placeholder="Password" type="password" value={empForm.password} onChange={e => setEmpForm(f => ({ ...f, password: e.target.value }))} required />
              <input placeholder="Employee ID" value={empForm.employeeId} onChange={e => setEmpForm(f => ({ ...f, employeeId: e.target.value }))} required />
              <button type="submit">Add</button>
            </form>
          </section>

          <section className="add-section">
            <h2>Add Shift</h2>
            <form className="add-form" onSubmit={handleAddShift}>
              <select value={shiftForm.employeeId} onChange={e => setShiftForm(f => ({ ...f, employeeId: e.target.value }))} required>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
              <input type="date" value={shiftForm.date} onChange={e => setShiftForm(f => ({ ...f, date: e.target.value }))} required />
              <input type="time" value={shiftForm.startTime} onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))} required />
              <input type="time" value={shiftForm.endTime} onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))} required />
              <input placeholder="Location" value={shiftForm.location} onChange={e => setShiftForm(f => ({ ...f, location: e.target.value }))} required />
              <button type="submit">Add</button>
            </form>
          </section>

          <section className="list-section">
            <h2>Employees</h2>
            {loading ? <p>Loading…</p> : (
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
                  {employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.username}</td>
                      <td>{emp.email}</td>
                      <td>{emp.employeeId}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteEmployee(emp._id)}>Delete</button>
                        <button onClick={() => exportAttendanceExcel(emp._id)}>
                          Export Attendance (Excel)
                        </button>
                        <button onClick={() => exportAttendancePDF(emp._id)}>
                          Export Attendance (PDF)
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan={5}>No employees found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </section>

          <section className="list-section">
            <h2>Shifts</h2>
            {loading ? <p>Loading…</p> : (
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
                  {shifts.map(shift => (
                    <tr key={shift._id}>
                      <td>
                        {(() => {
                          const emp = employees.find(e => e._id === (shift.employee?._id || shift.employee));
                          return emp ? `${emp.firstName} ${emp.lastName}` : (shift.employee?._id || shift.employee);
                        })()}
                      </td>
                      <td>{new Date(shift.date).toLocaleDateString()}</td>
                      <td>{shift.startTime}</td>
                      <td>{shift.endTime}</td>
                      <td>{shift.location}</td>
                      <td>{shift.status}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteShift(shift._id)}>Delete</button>
                        <button onClick={() => sendShiftReminder(shift._id, shift.employee.email)}>
                          Send Calendar Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr><td colSpan={7}>No shifts found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </section>

          <button onClick={exportAllAttendancePDF}>
            Export All Attendance (PDF)
          </button>
        </div>
        <Chatbot />
      </div>
    </>
  )
}
=======
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
                      <button onClick={() => fetchAttendanceForChart(emp._id)}>
                        View Charts
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

        {chartData && (
          <section className="chart-section">
            <h2>Attendance Charts</h2>
            <div className="chart-container">
              <div className="chart-card">
                <Bar
                  data={chartData.hours}
                  options={{
                    plugins: {
                      title: {
                        text: 'Hours Worked Over Time',
                      },
                    },
                  }}
                />
              </div>
              <div className="chart-card">
                <Doughnut
                  data={chartData.status}
                  options={{
                    plugins: {
                      title: {
                        text: 'Attendance Status Distribution',
                      },
                    },
                  }}
                />
              </div>
            </div>
            <button onClick={() => setChartData(null)}>Close Charts</button>
          </section>
        )}

        <button onClick={setTestChartData}>Test Charts</button>

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
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
