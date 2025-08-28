import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import { slide as Menu } from 'react-burger-menu';
import './assets/css/auth.css';

export const PrivacyPolicy = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init();
  }, []);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Privacy Policy</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=Sora:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <Preloader />
      <header className="main-header">
        <div className="header-sticky bg-section">
          <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">
                <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </Link>
              <div className="collapse navbar-collapse main-menu">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav ms-auto" id="menu">
                    <li className="nav-item">
                      <Link className="nav-link" to="/user">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/symptom-checker">Symptom Checker</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/medical-history">Medical History</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/screening-recommendations">Screening Portal</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/health-resources">Resource Portal</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/profile-settings">Profile Settings</Link>
                    </li>
                  </ul>
                </div>
                <div className="header-contact-btn">
                  <a href="tel:123456789" className="header-contact-now">
                    <i className="fa-solid fa-phone"></i>(+22) 123456789</a>
                  <Link to="/login" className="btn-default">Log In</Link>
                </div>
              </div>
            </div>
          </nav>
          <div className="responsive-menu">
            <Menu right isOpen={menuOpen} onStateChange={handleStateChange}>
              <div onClick={closeMenu}><Link to="/user">Home</Link></div>
              <div onClick={closeMenu}><Link to="/symptom-checker">Symptom Checker</Link></div>
              <div onClick={closeMenu}><Link to="/medical-history">Medical History</Link></div>
              <div onClick={closeMenu}><Link to="/screening-recommendations">Screening Portal</Link></div>
              <div onClick={closeMenu}><Link to="/health-resources">Resource Portal</Link></div>
              <div onClick={closeMenu}><Link to="/profile-settings">Profile Settings</Link></div>
              <Link to="/login">Log In</Link>
            </Menu>
          </div>
        </div>
      </header>
      <div className="page-header bg-section dark-section" data-aos="fade-up">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-3" data-cursor="-opaque">Privacy Policy</h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">home</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Privacy Policy</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="our-content-box" data-aos="fade-up">
                <h2 className="text-anime-style-3" data-cursor="-opaque">Aiyo Care Privacy Policy</h2>
                <div className="content-section" data-aos="fade-up" data-delay="200">
                  <h3>1. Introduction</h3>
                  <p>
                    Welcome to Aiyo Care. We are committed to protecting your personal information and respecting your privacy of your data. This Privacy policy explains how we collect, use, and safeguard your data when you use our services.
                  </p>
                </div>
                <div className="content-section" data-aos="fade-up" data-delay="400">
                  <h3>2. Data Collection</h3>
                  <p>
                    We collect information you provide, such as demographic data (age, gender, location), health information (symptoms, medical history), and contact details. We may also collect usage data (e.g., page views) via cookies.
                  </p>
                </div>
                <div className="content-section" data-aos="fade-up" data-delay="600">
                  <h3>3. Data Usage</h3>
                  <p>
                    Your data is used to provide personalized health recommendations, improve our services, and communicate with you. We do not sell your data to third parties.
                  </p>
                </div>
                <div className="content-section" data-aos="fade-up" data-delay="800">
                  <h3>4. Data Protection</h3>
                  <p>
                    We use industry-standard security measures (e.g., encryption, access controls) to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.
                  </p>
                </div>
                <div className="content-section" data-aos="fade-up" data-delay="1000">
                  <h3>5. Your Rights</h3>
                  <p>
                    You have the right to access, update, or delete your data. Contact us at <a href="mailto:domainname@gmail.com">domainname@gmail.com</a> to exercise these rights.
                  </p>
                </div>
                <div className="content-section" data-aos="fade-up" data-delay="1200">
                  <h3>6. Contact Us</h3>
                  <p>
                    For questions about this policy, contact us at <a href="mailto:domainname@gmail.com">domainname@gmail.com</a> or (+22) 123 456 789.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <Link to="/" className="btn-default" style={{ margin: '20px 0', display: 'inline-block' }}>
          Back to Home
        </Link>
      </div>
      <footer className="main-footer bg-section dark-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12">
              <div className="about-footer">
                <div className="footer-logo">
                  <img src="/images/logo.png" alt="Footer Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
                </div>
                <div className="about-footer-content">
                  <p>Empowering early detection of Cervical cancer for women's health</p>
                </div>
                <div className="footer-social-links">
                  <ul>
                    <li><a href="#"><i className="fa-brands fa-pinterest-p"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-x-twitter"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="footer-contact-box">
                <div className="footer-links footer-contact-item">
                  <h3>Contact:</h3>
                  <ul>
                    <li><i className="fa-solid fa-phone"></i><a href="tel:123456789">(+22) 123 456 789</a></li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>E-mail:</h3>
                  <ul>
                    <li><i className="fa-solid fa-envelope"></i><a href="mailto:domainname@gmail.com">domainname@gmail.com</a></li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>Address:</h3>
                  <ul>
                    <li><i className="fa-solid fa-location-dot"></i>123 High Street LN1 1AB Street UK</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="footer-copyright">
                <div className="footer-copyright-text">
                  <p>Copyright © 2025 All Rights Reserved.</p>
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
    </>
  );
};