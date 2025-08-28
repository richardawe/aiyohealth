import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';

const { useAuth } = AuthProvider;
import { slide as Menu } from 'react-burger-menu';
import './assets/css/auth.css';

export const Monitoring = () => {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    activeUsers: { total: 1245, last30Days: 300 },
    formSubmissions: { total: 5678, last30Days: 1200 },
  });
  const [errors, setErrors] = useState([
    { id: 1, date: 'April 12, 2025', error: 'Invalid symptom data entry', userId: '12345' },
    { id: 2, date: 'April 10, 2025', error: 'Database connection timeout', time: '14:32' },
  ]);

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
        <title>Aiyo Care - System Monitoring</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
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
              <Link className="navbar-brand" to="/admin">
                <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </Link>
              <div className="collapse navbar-collapse main-menu">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav ms-auto" id="menu">
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-users">
                        Manage Users
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/content-management">
                        Resource Portal
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/database">
                        Data Management
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customization">
                        Screening
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/monitoring">
                        Track
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="header-contact-btn">
                  <a href="tel:123456789" className="header-contact-now">
                    <i className="fa-solid fa-phone"></i>(+22) 123 456 789
                  </a>
                  <button className="btn-default" onClick={logout}>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <div className="responsive-menu">
            <Menu right isOpen={menuOpen} onStateChange={handleStateChange}>
              <div onClick={closeMenu}>
                <Link to="/admin" onClick={() => console.log('Navigating to /admin')}>
                  Home
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/manage-users" onClick={() => console.log('Navigating to /manage-users')}>
                  Manage Users
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/content-management" onClick={() => console.log('Navigating to /content-management')}>
                  Resource Portal
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/database" onClick={() => console.log('Navigating to /database')}>
                  Data Management
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/customization" onClick={() => console.log('Navigating to /customization')}>
                  Screening
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/monitoring" onClick={() => console.log('Navigating to /monitoring')}>
                  Track
                </Link>
              </div>
              <button className="btn-default" onClick={logout}>
                Log Out
              </button>
            </Menu>
          </div>
        </div>
      </header>
      <div className="page-header bg-section dark-section" data-aos="fade-up">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-3" data-cursor="-opaque">
                  System Monitoring
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/admin">Admin Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      System Monitoring
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-book-appointment">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="our-appointment-content">
                <div className="section-title">
                  <h3 data-aos="fade-up">usage stats</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                    System Usage
                  </h2>
                </div>
                <div className="appointment-content-body">
                  <div className="appointment-item" data-aos="fade-up" data-aos-delay="200">
                    <div className="appointment-item-content">
                      <h3>Active Users</h3>
                      <p>Total: {stats.activeUsers.total}</p>
                      <p>Last 30 Days: {stats.activeUsers.last30Days}</p>
                    </div>
                  </div>
                  <div className="appointment-item" data-aos="fade-up" data-aos-delay="400">
                    <div className="appointment-item-content">
                      <h3>Form Submissions</h3>
                      <p>Total: {stats.formSubmissions.total}</p>
                      <p>Last 30 Days: {stats.formSubmissions.last30Days}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="our-appointment-content">
                <div className="section-title">
                  <h3 data-aos="fade-up">system errors</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                    Error Logs
                  </h2>
                </div>
                <div className="appointment-content-body">
                  {errors.map((error, index) => (
                    <div
                      key={error.id}
                      className="appointment-item"
                      data-aos="fade-up"
                      data-aos-delay={`${(index + 2) * 200}`}
                    >
                      <div className="appointment-item-content">
                        <h3>{error.date}</h3>
                        <p>Error: {error.error}</p>
                        <p>{error.userId ? `User ID: ${error.userId}` : `Time: ${error.time}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <Link to="/admin" className="btn-default" style={{ margin: '20px 0', display: 'inline-block' }}>
          Back to Dashboard
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
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-pinterest-p"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-x-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="footer-contact-box">
                <div className="footer-links footer-contact-item">
                  <h3>Contact:</h3>
                  <ul>
                    <li>
                      <i className="fa-solid fa-phone"></i>
                      <a href="tel:123456789">(+22) 123 456 789</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>E-mail:</h3>
                  <ul>
                    <li>
                      <i className="fa-solid fa-envelope"></i>
                      <a href="mailto:domainname@gmail.com">domainname@gmail.com</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>Address:</h3>
                  <ul>
                    <li>
                      <i className="fa-solid fa-location-dot"></i>123 High Street LN1 1AB Street UK
                    </li>
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
                    <li>
                      <Link to="/privacy-policy">Privacy Policy</Link>
                    </li>
                    <li>
                      <Link to="/terms-conditions">Terms & Conditions</Link>
                    </li>
                    <li>
                      <Link to="/help">Help</Link>
                    </li>
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