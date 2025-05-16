import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
=======
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61

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
<<<<<<< HEAD
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Submit
        </button>
        <div className="text-center">
          <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div>
=======
          <button type="submit">Submit</button>
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
        </form>
      </div>
    </div>
  );
}