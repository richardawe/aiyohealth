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

export const User = () => {
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
        <title>User Dashboard</title>
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
              <Link className="navbar-brand" to="/user">
                <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </Link>
              <div className="collapse navbar-collapse main-menu">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav ms-auto" id="menu">
                    <li className="nav-item">
                      <Link className="nav-link" to="/user">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/medical-history">
                        Medical History
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/profile-settings">
                        Profile Settings
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/symptom-checker">
                        Symptom Checker
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/screening-recommendations">
                        Screening Recommendations
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="header-contact-btn">
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
                <Link to="/user" onClick={() => console.log('Navigating to /user')}>
                  Home
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/medical-history" onClick={() => console.log('Navigating to /medical-history')}>
                  Medical History
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/profile-settings" onClick={() => console.log('Navigating to /profile-settings')}>
                  Profile Settings
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/symptom-checker" onClick={() => console.log('Navigating to /symptom-checker')}>
                  Symptom Checker
                </Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/screening-recommendations" onClick={() => console.log('Navigating to /screening-recommendations')}>
                  Screening Recommendations
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
                  User Dashboard
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      User Dashboard
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
                <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                  User Actions
                </h2>
              </div>
            </div>
          </div>
          <div className="row mx-4 my-3">
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="200">
                <div className="appointment-item-content">
                  <h3>Medical History</h3>
                  <p>View and update your medical records</p>
                  <Link to="/medical-history" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="400">
                <div className="appointment-item-content">
                  <h3>Profile Settings</h3>
                  <p>Manage your account details</p>
                  <Link to="/profile-settings" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="appointment-item" data-aos="fade-up" data-aos-delay="600">
                <div className="appointment-item-content">
                  <h3>Symptom Checker</h3>
                  <p>Check symptoms and get advice</p>
                  <Link to="/symptom-checker" className="btn-default">
                    Access
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};