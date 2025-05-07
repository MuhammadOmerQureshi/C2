import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);

      const me = await api.get('/auth/me');
      switch (me.data.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'employer':
          navigate('/employer');
          break;
        case 'employee':
          navigate('/employee');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="logo-container">
        <img src="logo.png" alt="Logo" className="logo" />
        <h1 className="logo-text">
          <span>CESIUM</span>CLOCK
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm mt-6"
      >
        <h2 className="text-2xl mb-4">Login</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}

        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>

        <label className="block mb-4">
          Password
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </label>

        <button
          type="submit"
          className={`w-full text-white py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
