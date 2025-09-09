import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter email:', email);
  };

  return (
    <footer className="main-footer bg-section dark-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="footer-header">
              <div className="section-title footer-newsletter-title">
                <h2 className="text-anime-style-3" data-cursor="-opaque">Stay Informed on Cervical Cancer Prevention</h2>
              </div>
              <div className="footer-newsletter-form">
                <form id="newslettersForm" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="email"
                      name="mail"
                      className="form-control"
                      placeholder="Enter your email for updates"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="readmore-btn">
                      <img src="/images/arrow-white.svg" alt="Arrow icon for newsletter submission" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-12">
            <div className="about-footer">
              <div className="footer-logo">
              <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </div>
              <div className="about-footer-content">
                <p>Empowering women’s health through early detection and education on Cervical cancer prevention.</p>
              </div>
              <div className="footer-social-links">
                <ul>
                  <li><a href="#"><i className="fa-brands fa-pinterest-p" aria-label="Pinterest"></i></a></li>
                  <li><a href="#"><i className="fa-brands fa-x-twitter" aria-label="X (Twitter)"></i></a></li>
                  <li><a href="#"><i className="fa-brands fa-facebook-f" aria-label="Facebook"></i></a></li>
                  <li><a href="#"><i className="fa-brands fa-instagram" aria-label="Instagram"></i></a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="footer-links-box">
              <div className="footer-links quick-links">
                <h3>Quick Links</h3>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/health-resources">Health Resources</Link></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                  <li><Link to="/login">Portal</Link></li>
                </ul>
              </div>
              <div className="footer-links">
                <h3>Support Hours:</h3>
                <ul>
                  <li>Mon-Fri: 09:00 to 17:00</li>
                  <li>Weekends: Closed</li>
                </ul>
              </div>
            </div>
            <div className="footer-contact-box">
              <div className="footer-links footer-contact-item">
                <h3>Email:</h3>
                <ul>
                  <li><i className="fa-solid fa-envelope" aria-label="Email"></i><a href="mailto:aiyohealth@gmail.com">aiyohealth@gmail.com</a></li>
                </ul>
              </div>
              <div className="footer-links footer-contact-item">
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="footer-copyright">
              <div className="footer-copyright-text">
                <p>Copyright © 2025 Cervical Cancer Care. All Rights Reserved.</p>
              </div>
              <div className="footer-privacy-policy">
                <ul>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
                  <li><Link to="/help">Help</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;