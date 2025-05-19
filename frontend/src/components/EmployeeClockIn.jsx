import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function EmployeeClockIn() {
  const [status, setStatus] = useState('loading');
  const [activeSession, setActiveSession] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if employee has an active session
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/attendance/history');
        const sessions = response.data;
        // Find active session (no clock-out time)
        const active = sessions.find(session => !session.clockOutTime);
        if (active) {
          setActiveSession(active);
        }
        setStatus('ready');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance status');
        setStatus('error');
      }
    };
    checkStatus();
  }, []);

  // Handle clock-in
  const handleClockIn = async () => {
    try {
      setStatus('processing');
      const response = await api.post('/attendance/clock-in');
      setActiveSession(response.data.attendance);
      setSuccess('Clock-in successful');
      setTimeout(() => setSuccess(''), 3000);
      setStatus('ready');
    } catch (err) {
      // Handle IP verification errors specifically
      if (err.response?.status === 403) {
        setError('Clock-in denied: Your IP address is not approved. Please contact your company administrator.');
      } else {
        setError(err.response?.data?.message || 'Failed to clock in');
      }
      setStatus('error');
      setTimeout(() => {
        setError('');
        setStatus('ready');
      }, 5000);
    }
  };

  // Handle clock-out
  const handleClockOut = async () => {
    try {
      setStatus('processing');
      await api.post('/attendance/clock-out');
      setActiveSession(null);
      setSuccess('Clock-out successful');
      setTimeout(() => setSuccess(''), 3000);
      setStatus('ready');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clock out');
      setStatus('error');
      setTimeout(() => {
        setError('');
        setStatus('ready');
      }, 3000);
    }
  };

  if (status === 'loading') {
    return <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>;
  }

  return (
    <div className="clock-in-container">
      <h2>Attendance</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <div className="card-body text-center">
          <h5 className="card-title">Current Status</h5>
          {activeSession ? (
            <>
              <p className="card-text">
                You clocked in at {new Date(activeSession.clockInTime).toLocaleTimeString()} on {new Date(activeSession.clockInTime).toLocaleDateString()}
              </p>
              <button 
                className="btn btn-danger btn-lg" 
                onClick={handleClockOut}
                disabled={status === 'processing'}
              >
                {status === 'processing' ? 'Processing...' : 'Clock Out'}
              </button>
            </>
          ) : (
            <>
              <p className="card-text">You are currently clocked out</p>
              <button 
                className="btn btn-success btn-lg" 
                onClick={handleClockIn}
                disabled={status === 'processing'}
              >
                {status === 'processing' ? 'Processing...' : 'Clock In'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeClockIn;