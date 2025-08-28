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

export const MedicalHistory = () => {
  const { logout, token, apiBaseUrl } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.init();
    fetchSymptomHistory();
  }, []);

  const fetchSymptomHistory = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/symptom-history`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data.history);
      } else {
        setError(data.message || 'Failed to fetch medical history.');
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError('Error fetching medical history.');
    }
  };

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Medical History</title>
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
                      <Link className="nav-link" to="/symptom-checker">
                        Symptom Checker
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/medical-history">
                        Medical History
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/screening-recommendations">
                        Screening Portal
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/health-resources">
                        Resource Portal
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/profile-settings">
                        Profile Settings
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="header-contact-btn">
                  <a href="tel:123456789" className="header-contact-now">
                    <i className="fa-solid fa-phone"></i>(+234) 123456789
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
                <Link to="/user">Home</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/symptom-checker">Symptom Checker</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/medical-history">Medical History</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/screening-recommendations">Screening Portal</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/health-resources">Resource Portal</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/profile-settings">Profile Settings</Link>
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
                  Medical History
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/user">User Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Medical History
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
          <div className="row">
            <div className="col-lg-12">
              <div className="our-appointment-content">
                <div className="section-title">
                  <h3 data-aos="fade-up">Medical History</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                    Your Health Records
                  </h2>
                </div>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div className="appointment-content-body">
                  {history.length === 0 ? (
                    <p data-aos="fade-up">No medical history available.</p>
                  ) : (
                    history.map((record, index) => (
                      <div
                        key={record.id}
                        className="appointment-item"
                        data-aos="fade-up"
                        data-aos-delay={`${(index + 2) * 200}`}
                      >
                        <div className="appointment-item-content">
                          <h3 className="text-primary mb-3">{formatDate(record.logged_at)}</h3>
                          <p>
                            <strong>Demographics:</strong> Name: {record.full_name || 'N/A'}, Age: {record.age || calculateAge(record.dob) || 'N/A'}, 
                            Gender: {record.gender || 'N/A'}, Ethnicity: {record.ethnicity || record.ethnicity_other_input || 'N/A'}
                          </p>
                          <p>
                            <strong>Symptoms:</strong> Abnormal Bleeding: {record.abnormal_bleeding === 'yes' ? 
                              `Yes (${record.bleeding_type || 'N/A'})${record.post_coital_or_post_menopausal === 'yes' ? ' - Post-coital/Post-menopausal' : ''}` : 'No'}, 
                            Abnormal Discharge: {record.abnormal_discharge || 'N/A'}, 
                            Pelvic Pain: {record.pelvic_pain || 'N/A'}, 
                            Painful Intercourse: {record.painful_intercourse || 'N/A'}, 
                            Menstrual Changes: {record.menstrual_changes || 'N/A'}, 
                            Weight Loss: {record.weight_loss || 'N/A'}, 
                            Fatigue: {record.fatigue || 'N/A'},
                            Pregnant: {record.pregnant || 'N/A'}
                          </p>
                          <p>
                            <strong>Risk Factors:</strong> Sexual Partners: {record.num_sexual_partners || 'N/A'}, 
                            Age at First Intercourse: {record.age_first_intercourse || 'N/A'}, 
                            Contraceptive Use: {record.contraceptive_use === 'yes' ? `Yes (${record.contraceptive_duration || 'duration not specified'})` : 'No'}, 
                            Smoking: {record.smoking_status === 'yes' ? `Yes (${record.cigarettes_per_day || 'amount not specified'})` : 'No'}, 
                            HIV Status: {record.hiv_status || 'N/A'}, 
                            Parity: {record.parity || 'N/A'}, 
                            Marital Status: {record.marital_status || 'N/A'}
                          </p>
                          <div className="mt-4">
                            <strong className="d-block mb-2">Assessment Results:</strong>
                            <p className="mb-2">Risk Score: <span className="badge bg-warning text-dark">{record.risk_score}%</span> - 
                            <span className={`badge ${
                              record.risk_category === 'High risk' ? 'bg-danger' : 
                              record.risk_category === 'Medium risk' ? 'bg-warning text-dark' : 
                              'bg-success'
                            } ms-2`}>{record.risk_category}</span></p>
                            <p className="mb-2">{record.scenario}</p>
                            <div className="mt-3">
                              <h5>Recommendations:</h5>
                              <p className="mb-2">{record.predefined_recommendations}</p>
                              <h6 className="mt-3">Personalized Recommendations:</h6>
                              <ul className="list-unstyled">
                                {record.personalized_recommendations.map((rec, idx) => (
                                  <li key={idx} className="mb-1">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <Link to="/user" className="btn-default" style={{ margin: '20px 0', display: 'inline-block' }}>
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
                      <a href="tel:123456789">(+234) 123456789</a>
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

  function calculateAge(dob) {
    try {
      const birthdate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  }
};