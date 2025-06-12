import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';
import SpinningLogo from '../components/SpinningLogo';
import '../styles/pages/adminDashboard.css';

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
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const navigate = useNavigate();

  // For overview cards
  const totalEmployers = employers.length;
  const activeEmployers = employers.filter(e => e.status === 'active').length;
  const pendingInvitations = employers.filter(e => e.status === 'invited').length;

  // For analytics (dummy data, replace with real if available)
  const platformStats = [
    { label: 'Total Users', value: 127 },
    { label: 'Active Employers', value: activeEmployers },
    { label: 'Recent Logins', value: 13 }
  ];
  const recentActivity = [
    'Jane Doe reset her password',
    'John Smith added 2 employees',
    'Admin updated status of Employer ID 101'
  ];

  const fetchEmployers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users?role=employer');
      setEmployers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employers');
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
      await api.post('/admin/employers', form); // Do NOT send employerId
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



  const onSelectAll = () => {
    if (selected.length === employers.length) setSelected([]);
    else setSelected(employers.map(e => e._id));
  };

  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setResetError('');
    setShowResetModal(true);
  };

  const submitPasswordReset = async () => {
    if (!newPassword) {
      setResetError('Password cannot be empty');
      return;
    }
    try {
      await api.put(`/admin/users/${selectedUser._id}/password`, { password: newPassword });
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword('');
      setResetError('');
      fetchEmployers();
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <>
      {/* <SpinningLogo /> */}

      {/* ===== Header ===== */}
      <header className="header">
        <img src="/logo.png" alt="CesiumClock Logo" className="spinning-logo"/>
        <h1 className="header-title">Admin Dashboard</h1>
        <button className="btn btn-logout" onClick={() => logout(navigate)}>
          Logout
        </button>
      </header>

      {/* ===== Notifications ===== */}
      <div className="notifications">
        <p><strong>🛡️ Admin:</strong> Manage employers and platform users here.</p>
      </div>

      <main className="main-content">
        {/* ===== Overview Cards ===== */}
        <section className="overview">
          <div className="card">
            <h3>Total Employers</h3>
            <p className="stat-number">{totalEmployers}</p>
          </div>
          <div className="card">
            <h3>Active Employers</h3>
            <p className="stat-number">{activeEmployers}</p>
          </div>
          <div className="card">
            <h3>Pending Invitations</h3>
            <p className="stat-number">{pendingInvitations}</p>
          </div>
        </section>

        {/* ===== Dashboard Body ===== */}
        <div className="dashboard-body">
          {/* LEFT: Create Employer and Employer Table */}
          <div className="dashboard-left">
            {/* Create Employer Form */}
            <section className="forms">
              <div className="form-card">
                <h2>Create Employer</h2>
                <form className="create-form" onSubmit={onCreate}>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name<span className="required">*</span></label>
                    <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name<span className="required">*</span></label>
                    <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="username">Username<span className="required">*</span></label>
                    <input type="text" id="username" name="username" value={form.username} onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email<span className="required">*</span></label>
                    <input type="email" id="email" name="email" value={form.email} onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password<span className="required">*</span></label>
                    <input type="password" id="password" name="password" value={form.password} onChange={onChange} required minLength={6} />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Employer</button>
                </form>
              </div>
            </section>


            {/* Employers Table */}
            <section className="tables">
              <div className="table-card">
                <h2>Employers</h2>
                <div className="table-scrollable">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" checked={selected.length === employers.length && employers.length > 0} onChange={onSelectAll} />
                        </th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.map(emp => (
                        <tr key={emp._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selected.includes(emp._id)}
                              onChange={() => onSelect(emp._id)}
                            />
                          </td>
                          <td>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.username}</td>
                          <td>{emp.email}</td>
                          <td>{emp.prettyEmployerId}</td>
                          <td>
                            <select
                              value={emp.status}
                              onChange={e => onStatusChange(emp._id, e.target.value)}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                              <option value="invited">Invited</option>
                            </select>
                          </td>
                          <td className="actions">
                            <button className="btn btn-sm btn-secondary" onClick={() => setShowDetails(emp)}>
                              Details
                            </button>
                            <button
  className="btn btn-sm btn-warning"
  onClick={() => handleResetPasswordClick(emp)}
>
  Reset Password
</button>
                            <button className="btn btn-sm btn-danger" onClick={() => onDelete(emp._id)}>
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
                </div>
              </div>
            </section>
            {error && <div className="mb-4" style={{ color: 'var(--danger-color)' }}>{error}</div>}
          </div>

          {/* RIGHT: Platform stats, activity logs, or widgets */}
          <aside className="dashboard-right">
            <div className="analytics-card">
              <h2>Platform Stats</h2>
              <ul>
                {platformStats.map(stat => (
                  <li key={stat.label}>{stat.label}: <b>{stat.value}</b></li>
                ))}
              </ul>
            </div>
            <div className="analytics-card">
              <h2>Recent Activity</h2>
              <ul>
                {recentActivity.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Employer Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl mb-2">Employer Details</h3>
            <pre className="mb-4 text-sm bg-gray-100 p-2 rounded">{JSON.stringify(showDetails, null, 2)}</pre>
            <button onClick={() => setShowDetails(null)} className="btn btn-primary">Close</button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal" style={{
            background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: 12 }}>
              Reset Password for {selectedUser?.firstName} {selectedUser?.lastName}
            </h3>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: 8 }}
            />
            {resetError && <div style={{ color: 'red', marginBottom: 8 }}>{resetError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-warning" onClick={submitPasswordReset}>Set Password</button>
              <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
        </div>
        <div className="footer-bottom">
          <p>© 2025 CesiumClock. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
