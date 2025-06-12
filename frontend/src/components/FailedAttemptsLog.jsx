import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function FailedAttemptsLog() {
  const [failedAttempts, setFailedAttempts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/employer/failed_attempts')
      .then(res => setFailedAttempts(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load failed attempts'));
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Failed Clock-in Attempts</h2>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Time</th>
            <th>IP Address</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {failedAttempts.map(attempt => (
            <tr key={attempt._id}>
              <td>{attempt.employee?.firstName} {attempt.employee?.lastName}</td>
              <td>{new Date(attempt.attemptTime).toLocaleString()}</td>
              <td>{attempt.ipAddress}</td>
              <td>{attempt.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}