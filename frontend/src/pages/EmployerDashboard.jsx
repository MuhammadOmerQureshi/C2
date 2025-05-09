import api from '../api/axiosConfig';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { logout } from '../utils/logout'
import './EmployerDashboard.css'

export default function EmployerDashboard() {
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
    setLoading(true);
    setError('');
    try {
      console.log('Fetching employees and shifts...');
      const [empRes, shiftRes] = await Promise.all([
        api.get('/employees'),
        api.get('/shifts'),
      ]);
      console.log('Employees Response:', empRes.data);
      console.log('Shifts Response:', shiftRes.data);
  
      setEmployees(empRes.data);
      setShifts(shiftRes.data);
    } catch (err) {
      console.error('Error in fetchAll:', err);
      setError('Failed to load data');
    }
    setLoading(false);
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
    }
  }

  async function handleDeleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return
    setError('')
    try {
      await api.delete(`/employees/${id}`)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee')
    }
  }

  async function handleAddShift(e) {
    e.preventDefault()
    setError('')
    try {
      console.log('📤 shiftForm about to POST:', shiftForm);

      await api.post('/shifts', shiftForm)
      setShiftForm({ employeeId: '', date: '', startTime: '', endTime: '', location: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add shift')
    }
  }

  async function handleDeleteShift(id) {
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
    <div className="employer-dashboard">
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
                      const emp = employees.find(e => e._id === (shift.employeeId || shift.employee));
                      return emp ? `${emp.firstName} ${emp.lastName}` : shift.employeeId || shift.employee;
                    })()}
                  </td>
                  <td>{new Date(shift.date).toLocaleDateString()}</td>
                  <td>{shift.startTime}</td>
                  <td>{shift.endTime}</td>
                  <td>{shift.location}</td>
                  <td>{shift.status}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteShift(shift._id)}>Delete</button>
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
    </div>
  )
}