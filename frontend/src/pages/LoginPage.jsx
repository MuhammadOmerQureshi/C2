import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import
import './LoginPage.css'; // Ensure the CSS file is linked

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password }
      );
      localStorage.setItem('token', res.data.token);

      // Redirect based on role
      if (res.data.user.role === 'employee') {
        navigate('/employee-dashboard');
      } else if (res.data.user.role === 'employer') {
        navigate('/employer-dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Login failed. Please try again.');
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
      </form>
    </div>
  );
}
