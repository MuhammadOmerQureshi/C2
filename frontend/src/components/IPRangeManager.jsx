import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const IPRangeManager = () => {
  const [settings, setSettings] = useState(null);
  const [newRange, setNewRange] = useState({ name: '', startIP: '', endIP: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employer/settings');
      setSettings(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setNewRange({
      ...newRange,
      [e.target.name]: e.target.value
    });
  };
  
  const addIPRange = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employer/ip-ranges', newRange);
      setNewRange({ name: '', startIP: '', endIP: '' });
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add IP range');
    }
  };
  
  const toggleIPRange = async (rangeId, active) => {
    try {
      await api.put(`/employer/ip-ranges/${rangeId}`, { active: !active });
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update IP range');
    }
  };
  
  const deleteIPRange = async (rangeId) => {
    if (window.confirm('Are you sure you want to delete this IP range?')) {
      try {
        await api.delete(`/employer/ip-ranges/${rangeId}`);
        fetchSettings();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete IP range');
      }
    }
  };
  
  const toggleVerification = async () => {
    try {
      await api.put('/employer/settings', {
        enforceIPVerification: !settings.enforceIPVerification
      });
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle verification');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="ip-range-manager">
      <h2>IP Range Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>IP Verification</h3>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={settings?.enforceIPVerification}
              onChange={toggleVerification}
              id="verificationToggle"
            />
            <label className="form-check-label" htmlFor="verificationToggle">
              {settings?.enforceIPVerification ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        </div>
        <div className="card-body">
          <p>
            When enabled, employees can only clock in from approved IP addresses.
            {!settings?.approvedIPRanges?.length && ' No IP ranges have been added yet.'}
          </p>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h3>Add New IP Range</h3>
        </div>
        <div className="card-body">
          <form onSubmit={addIPRange}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={newRange.name}
                onChange={handleInputChange}
                placeholder="Office Network"
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="startIP" className="form-label">Start IP</label>
                <input
                  type="text"
                  className="form-control"
                  id="startIP"
                  name="startIP"
                  value={newRange.startIP}
                  onChange={handleInputChange}
                  placeholder="192.168.1.1"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="endIP" className="form-label">End IP</label>
                <input
                  type="text"
                  className="form-control"
                  id="endIP"
                  name="endIP"
                  value={newRange.endIP}
                  onChange={handleInputChange}
                  placeholder="192.168.1.255"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add IP Range</button>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>Approved IP Ranges</h3>
        </div>
        <div className="card-body">
          {settings?.approvedIPRanges?.length === 0 ? (
            <p>No IP ranges have been added yet.</p>
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
                {settings?.approvedIPRanges?.map(range => (
                  <tr key={range._id}>
                    <td>{range.name}</td>
                    <td>{range.startIP}</td>
                    <td>{range.endIP}</td>
                    <td>
                      <span className={`badge ${range.active ? 'bg-success' : 'bg-danger'}`}>
                        {range.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => toggleIPRange(range._id, range.active)}
                      >
                        {range.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteIPRange(range._id)}
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
    </div>
  );
};

export default IPRangeManager;
