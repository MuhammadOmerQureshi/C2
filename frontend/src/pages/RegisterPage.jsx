/*                      REMOVING REGISTRATION FOR PUBLIC USERS



import React, { useState } from 'react';
import api from "../api/axiosConfig.js";    // ← make sure this matches

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'employee'
  });

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      alert('Registered! Now log in.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4">Sign Up</h2>
        <label className="block mb-2">
          First Name
          <input
            name="firstName"
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-2">
          Last Name
          <input
            name="lastName"
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-2">
          Email
          <input
            name="email"
            type="email"
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-2">
          Password
          <input
            name="password"
            type="password"
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-4">
          Role
          <select
            name="role"
            onChange={onChange}
            className="w-full p-2 border rounded"
            value={form.role}
          >
            <option value="employee">Employee</option>
            <option value="employer">Employer</option>
          </select>
        </label>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
}

*/

