import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import '../styles/pages/loginPage.css'; // Make sure this path matches your project

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
      localStorage.setItem('userId', me.data._id); // <-- Save userId for later use
      if (me.data.role === 'admin') navigate('/admin');
      else if (me.data.role === 'employer') navigate('/employer');
      else if (me.data.role === 'employee') navigate('/employee');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <main className="login-main-center">
        <div className="login-logo-container">
          <img src="/logo.png" alt="CesiumClock Logo" className="login-logo" />
          <div className="login-logo-text"><span>CESIUM</span>CLOCK</div>
        </div>
        <section className="login-card">
          <h2 className="login-title">Sign In</h2>
          {error && <div className="login-error">{error}</div>}
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              className="login-input"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="login-btn-primary">Sign In</button>
          </form>
          <div className="login-links">
            <Link to="/forgot-password" className="login-link">
              Forgot Password?
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer login-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Team &amp; Careers</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Developer Hub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Policies</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Settings</a></li>
            </ul>
          </div>
          <div className="footer-section social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook" className="icon-facebook">F</a>
              <a href="#" aria-label="Twitter" className="icon-twitter">T</a>
              <a href="#" aria-label="LinkedIn" className="icon-linkedin">L</a>
              <a href="#" aria-label="Instagram" className="icon-instagram">I</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 CesiumClock. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}



