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
      // Login request
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);

      // Get user info to determine role
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
       <div className="logo-container">
        <img src="logo.png" alt="Logo" className="logo" />
        <h1 className="logo-text">
          <span>CESIUM</span>CLOCK
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl mb-4">Login</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-4">
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>
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
      </form>
    </div>
  );
}
