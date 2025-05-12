import api from '../api/axiosConfig'; // Import your centralized Axios instance
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Add this import
import './LoginPage.css'; // Ensure the CSS file is linked

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message
    try {
      // Login request
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      // Get user info to determine role
      const me = await api.get("/auth/me");
      if (me.data.role === "admin") navigate("/admin");
      else if (me.data.role === "employer") navigate("/employer");
      else if (me.data.role === "employee") navigate("/employee");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl mb-4 text-center">Login</h2> {/* Added text-center for heading */}
        {error && <div className="mb-2 text-red-600 text-center">{error}</div>} {/* Added text-center for error */}
        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mt-1" /* Added mt-1 for spacing */
            required
          />
        </label>
        <label className="block mb-4">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mt-1" /* Added mt-1 for spacing */
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-3" /* Added hover effect and mb-3 */
        >
          Login {/* Changed from Submit to Login for clarity */}
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
