// EmployerIPSettings.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function EmployerIPSettings() {
  const [settings, setSettings] = useState(null);
  const [ipRanges, setIpRanges] = useState([]);
  const [newRange, setNewRange] = useState({ name: '', startIP: '', endIP: '' });
  const [enforceVerification, setEnforceVerification] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch employer settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/employer/settings');
        setSettings(response.data);
        setIpRanges(response.data.approvedIPRanges || []);
        setEnforceVerification(response.data.enforceIPVerification);
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  // Add new IP range
  const handleAddRange = async (e) => {
    e.preventDefault();
    try {

    const response = await api.post('/employer/ip-ranges', newRange);


      setIpRanges([...ipRanges, response.data.ipRange]);
      setNewRange({ name: '', startIP: '', endIP: '' });
      setSuccess('IP range added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add IP range');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Delete IP range
  const handleDeleteRange = async (id) => {
    try {
      await api.delete(`/employer/ip-ranges/${id}`);
      setIpRanges(ipRanges.filter(range => range._id !== id));
      setSuccess('IP range deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete IP range');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Toggle IP verification enforcement
  const toggleEnforcement = async () => {
    try {
      await api.put('/employer/settings', {
        enforceIPVerification: !enforceVerification
      });
      setEnforceVerification(!enforceVerification);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="ip-settings-container">
      <h2>IP Verification Settings</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>IP Verification</h5>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={enforceVerification}
              onChange={toggleEnforcement}
              id="enforceVerification"
            />
            <label className="form-check-label" htmlFor="enforceVerification">
              {enforceVerification ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        </div>
        <div className="card-body">
          <p>When enabled, employees can only clock in from approved IP addresses.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Approved IP Ranges</h5>
        </div>
        <div className="card-body">
          {ipRanges.length === 0 ? (
            <p>No IP ranges defined yet. Add your first IP range below.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start IP</th>
                  <th>End IP</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ipRanges.map(range => (
                  <tr key={range._id}>
                    <td>{range.name}</td>
                    <td>{range.startIP}</td>
                    <td>{range.endIP}</td>
                    <td>
                      <span className={`badge ${range.active ? 'bg-success' : 'bg-secondary'}`}>
                        {range.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteRange(range._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Add New IP Range</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddRange}>
            <div className="mb-3">
              <label htmlFor="rangeName" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="rangeName"
                value={newRange.name}
                onChange={(e) => setNewRange({...newRange, name: e.target.value})}
                placeholder="e.g., Office Network"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="startIP" className="form-label">Start IP</label>
              <input
                type="text"
                className="form-control"
                id="startIP"
                value={newRange.startIP}
                onChange={(e) => setNewRange({...newRange, startIP: e.target.value})}
                placeholder="e.g., 192.168.1.1"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="endIP" className="form-label">End IP</label>
              <input
                type="text"
                className="form-control"
                id="endIP"
                value={newRange.endIP}
                onChange={(e) => setNewRange({...newRange, endIP: e.target.value})}
                placeholder="e.g., 192.168.1.255"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Add IP Range</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployerIPSettings;