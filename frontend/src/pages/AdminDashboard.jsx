import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';
import SpinningLogo from '../components/SpinningLogo';
import '../styles/pages/admin.css'

export default function AdminDashboard() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', password: ''
  });
  const [selected, setSelected] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [bulkStatus, setBulkStatus] = useState('active');
  const navigate = useNavigate();

  const fetchEmployers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users?role=employer');
      setEmployers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employers'); // Handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onCreate = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/employers', form);
      setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employer');
    }
  };

  const onStatusChange = async (id, status) => {
    setError('');
    try {
      await api.put('/admin/status', { userId: id, status });
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const onDelete = async (id) => {
    setError('');
    if (!window.confirm('Are you sure you want to delete this employer?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employer');
    }
  };

  // Bulk actions
  const onSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
  };

  const onSelectAll = () => {
    if (selected.length === employers.length) setSelected([]);
    else setSelected(employers.map(e => e._id));
  };

  const onBulkStatus = async () => {
    setError('');
    try {
      await api.put('/admin/bulk-status', { userIds: selected, status: bulkStatus });
      setSelected([]);
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk status update failed');
    }
  };

  const onBulkDelete = async () => {
    setError('');
    if (!window.confirm('Delete selected employers?')) return;
    try {
      await api.delete('/admin/bulk-delete', { data: { userIds: selected } });
      setSelected([]);
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk delete failed');
    }
  };

  // Reset password
  const onResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/admin/users/${resetId}/password`, { password: resetPassword });
      setResetId(null);
      setResetPassword('');
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <>
      <SpinningLogo />
      <div className="p-6">
        <div className="dashboard-scroll">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl">            Admin Dashboard</h1>
            <button
              onClick={() => logout(navigate)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          <h2 className="text-xl mb-2">Create Employer</h2>
          <form onSubmit={onCreate} className="mb-6 flex flex-wrap gap-2">
            <input name="firstName" value={form.firstName} onChange={onChange} placeholder="First Name" required className="p-2 border rounded" />
            <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Last Name" required className="p-2 border rounded" />
            <input name="username" value={form.username} onChange={onChange} placeholder="Username" required className="p-2 border rounded" />
            <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" required className="p-2 border rounded" />
            <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" required className="p-2 border rounded" />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
          </form>

          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="mb-4 flex items-center gap-2">
            <button onClick={onSelectAll} className="bg-gray-200 px-2 py-1 rounded">
              {selected.length === employers.length ? 'Unselect All' : 'Select All'}
            </button>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="p-1 border rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={onBulkStatus} disabled={!selected.length} className="bg-blue-500 text-white px-2 py-1 rounded">
              Bulk Update Status
            </button>
            <button onClick={onBulkDelete} disabled={!selected.length} className="bg-red-500 text-white px-2 py-1 rounded">
              Bulk Delete
            </button>
          </div>

          <h2 className="text-xl mb-2">Employers</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">
                    <input type="checkbox" checked={selected.length === employers.length} onChange={onSelectAll} />
                  </th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Username</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employers.map(emp => (
                  <tr key={emp._id}>
                    <td className="border px-2 py-1">
                      <input
                        type="checkbox"
                        checked={selected.includes(emp._id)}
                        onChange={() => onSelect(emp._id)}
                      />
                    </td>
                    <td className="border px-2 py-1">{emp.firstName} {emp.lastName}</td>
                    <td className="border px-2 py-1">{emp.username}</td>
                    <td className="border px-2 py-1">{emp.email}</td>
                    <td className="border px-2 py-1">
                      <select
                        value={emp.status}
                        onChange={e => onStatusChange(emp._id, e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="border px-2 py-1 flex gap-1">
                      <button
                        onClick={() => setShowDetails(emp)}
                        className="bg-gray-300 px-2 py-1 rounded"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => { setResetId(emp._id); setResetPassword(''); }}
                        className="bg-yellow-400 px-2 py-1 rounded"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => onDelete(emp._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {employers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-2">No employers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Employer Details Modal */}
          {showDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h3 className="text-xl mb-2">Employer Details</h3>
                <pre className="mb-4 text-sm bg-gray-100 p-2 rounded">{JSON.stringify(showDetails, null, 2)}</pre>
                <button onClick={() => setShowDetails(null)} className="bg-blue-500 text-white px-4 py-2 rounded">Close</button>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {resetId && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <form onSubmit={onResetPassword} className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                <h3 className="text-xl mb-2">Reset Password</h3>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="w-full p-2 border rounded mb-4"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">Set Password</button>
                  <button type="button" onClick={() => setResetId(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
