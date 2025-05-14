import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      const me = await api.get('/auth/me');
      if (me.data.role === 'admin') navigate('/admin');
      else if (me.data.role === 'employer') navigate('/employer');
      else if (me.data.role === 'employee') navigate('/employee');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-outer-center">
      {/* Orbiting and spinning logo container */}
      <div className="logo-container">
        <img src="/logo.png" alt="App Logo" className="logo" />
        <div className="logo-text">
          <span>CESIUM</span>CLOCK
        </div>
      </div>

      {/* Login form */}
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          {error && <div className="mb-2 text-red-600">{error}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}