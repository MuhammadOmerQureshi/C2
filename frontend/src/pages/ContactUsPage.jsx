import React, { useState } from 'react';
import api from '../api/axiosConfig';

const initialForm = { name: '', email: '', message: '', agree: false };

const ContactUsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Name is required';
    } else if (/\d/.test(form.name)) {
      errs.name = 'Name must not contain numbers';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      errs.email = 'Invalid email address';
    }
    if (!form.message.trim()) {
      errs.message = 'Message is required';
    }
    if (!form.agree) {
      errs.agree = 'You must agree to be contacted';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('Sending...');
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        message: form.message,
      });
      setStatus('Message sent!');
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to send message.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20 }}>
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Name:</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
          {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
        </div>
        <div>
          <label>Email:</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </div>
        <div>
          <label>Message:</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
          {errors.message && <div style={{ color: 'red' }}>{errors.message}</div>}
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            I agree to be contacted
          </label>
          {errors.agree && <div style={{ color: 'red' }}>{errors.agree}</div>}
        </div>
        <button type="submit" style={{ marginTop: 10 }}>Send</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default ContactUsPage;