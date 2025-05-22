import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll event for back-to-top button visibility
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle newsletter subscription
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    setMessage('Thank you for subscribing to our newsletter!');
    setShowMessage(true);
    setEmail('');
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Cesium Clock</h3>
          <p>&copy; {new Date().getFullYear()} Cesium Clock. All rights reserved.</p>
        </div>
        
        <div className="footer-section">
          <h3>Links</h3>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://twitter.com/c2" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fa fa-twitter"></i> Twitter
            </a>
            <a href="https://facebook.com/c2" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fa fa-facebook"></i> Facebook
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe for updates and news</p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              aria-label="Email for newsletter"
            />
            <button type="submit" aria-label="Subscribe">Subscribe</button>
          </form>
          {showMessage && <p className="subscription-message">{message}</p>}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>Designed and developed with ❤️ by the Cesium Clock Team</p>
      </div>
      
      {isVisible && (
        <button 
          onClick={scrollToTop} 
          className="back-to-top" 
          aria-label="Back to top"
        >
          <i className="fa fa-arrow-up"></i>
        </button>
      )}
    </footer>
  );
};

export default Footer;

