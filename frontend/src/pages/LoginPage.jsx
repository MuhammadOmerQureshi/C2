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
    <div className="login login-outer-center">
      {/* Logo outside the card, centered */}
      <img
        src="/logo.png"
        alt="App Logo"
        className="login-logo horizontal-spin"
      />

      <div className="login-card">
        {/* Neon title */}
        <h1 className="login-title" data-text="CesiumClock">
          CesiumClock
        </h1>

        {/* Optionally, a live clock can be placed here */}
        {/* <div id="live-clock"></div> */}

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit}>
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
