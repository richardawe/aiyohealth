import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';
import { slide as Menu } from 'react-burger-menu';
import './assets/css/auth.css';

const { useAuth } = AuthProvider;

export const Admin = () => {
  const { logout } = useAuth();
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
        <title>Admin Dashboard</title>
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
                <img src="/images/logo.svg" alt="Logo" />
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
                  Admin Dashboard
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Admin Dashboard
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
          <div className="row mx-4 my-3">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h3 data-aos="fade-up">Admin Panel</h3>
                <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                  Choose an Action
                </h2>
              </div>
            </div>
          </div>
          <div className="row mx-4 my-3">
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="200">
                <div className="appointment-item-content">
                  <h3>User Management</h3>
                  <p>Manage user accounts and ensure security</p>
                  <Link to="/manage-users" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="400">
                <div className="appointment-item-content">
                  <h3>Database Oversight</h3>
                  <p>Analyze anonymized data and export reports</p>
                  <Link to="/database" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="600">
                <div className="appointment-item-content">
                  <h3>Recommendation Customization</h3>
                  <p>Update screening guideline logic</p>
                  <Link to="/customization" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="800">
                <div className="appointment-item-content">
                  <h3>System Monitoring</h3>
                  <p>Monitor usage stats and errors</p>
                  <Link to="/monitoring" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="1000">
                <div className="appointment-item-content">
                  <h3>Content Management</h3>
                  <p>Add educational resources for users</p>
                  <Link to="/content-management" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="main-footer bg-section dark-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12">
              <div className="about-footer">
                <div className="footer-logo">
                  <img src="/images/footer-logo.svg" alt="Footer Logo" />
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
                      <Link to="/privacy-policy">Privacy policy</Link>
                    </li>
                    <li>
                      <Link to="/terms-conditions">Term's & condition</Link>
                    </li>
                    <li>
                      <Link to="/help">help</Link>
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