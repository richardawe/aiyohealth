import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import { slide as Menu } from 'react-burger-menu';
import './assets/css/auth.css';

const { useAuth } = AuthProvider;

export const ScreeningRecommendations = () => {
  const { user, token, logout, isLoading, apiBaseUrl } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init();
    if (isLoading) return;
    if (!token || !user) {
      console.log('Not authenticated, redirecting to /login');
      navigate('/login');
      return;
    }
    fetchRecommendations();
  }, [token, user, isLoading, navigate]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);      const response = await fetch(`${apiBaseUrl}/screening-recommendations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // Check content type before trying to parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check your session and try again.');
      }

      const data = await response.json();
      console.log('Recommendations response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          logout();
          navigate('/login');
          return;
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleRetry = () => {
    fetchRecommendations();
  };

  if (isLoading || loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Recommendations</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={handleRetry} variant="outline-danger" className="me-2">
              Try Again
            </Button>
            {error.includes('log in') && (
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            )}
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Screening Recommendations</title>
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
              <div className="collapse main-menu">
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
                    <i className="fa-solid fa-phone"></i>(+22) 123 456 789
                  </a>
                  <button className="btn-default" onClick={logout}>Log Out</button>
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
              <button className="btn-default" onClick={logout}>Log Out</button>
            </Menu>
          </div>
        </div>
      </header>
      <div className="page-header bg-section dark-section" data-aos="fade-up">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-3" data-cursor="-opaque">Screening Recommendations</h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">home</Link></li>
                    <li className="breadcrumb-item"><Link to="/user">User Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Screening Recommendations</li>
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
                  <h3 data-aos="fade-up">screening advice</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">Personalized Recommendations</h2>
                </div>
                <div className="appointment-content-body">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.id}
                      className="appointment-item"
                      data-aos="fade-up"
                      data-aos-delay={`${(index + 2) * 200}`}
                    >
                      <div className="appointment-item-content">
                        <h3>{rec.title}</h3>
                        {/* Assessment-based recommendation (has risk_score) */}
                        {rec.risk_score !== undefined && (
                          <>
                            <p><strong>Risk Score:</strong> {rec.risk_score}</p>
                            <p><strong>Risk Category:</strong> {rec.risk_category}</p>
                            {rec.scenario && <p><strong>Scenario:</strong> {rec.scenario}</p>}
                            {rec.predefined_recommendations && (
                              <div className="recommendation-details">
                                <strong>Predefined Recommendations:</strong>
                                <p>{rec.predefined_recommendations}</p>
                              </div>
                            )}
                            {rec.personalized_recommendations && rec.personalized_recommendations.length > 0 && (
                              <div className="recommendation-details">
                                <strong>Personalized Recommendations:</strong>
                                <ul>
                                  {rec.personalized_recommendations.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {rec.assessment_date && (
                              <p><strong>Assessment Date:</strong> {rec.assessment_date}</p>
                            )}
                          </>
                        )}
                        {/* General recommendations (no risk_score) */}
                        {rec.recommendation && (
                          <p className="recommendation-text"><strong>Recommendation:</strong> {rec.recommendation}</p>
                        )}
                        {rec.details && (
                          typeof rec.details === 'string' ? (
                            <p className="recommendation-details"><strong>Details:</strong> {rec.details}</p>
                          ) : (
                            <div className="recommendation-details">
                              {rec.details.map((detail, i) => (
                                <p key={i}>{detail}</p>
                              ))}
                            </div>
                          )
                        )}
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
        <Link to="/user" className="btn-default" style={{ margin: '20px 0', display: 'inline-block' }}>
          Back to Dashboard
        </Link>
        <Link to="/symptom-checker" className="btn btn-primary" style={{ margin: '20px 10px', display: 'inline-block' }}>
          Take Symptom Assessment
        </Link>
      </div>
      <footer className="main-footer bg-section dark-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12">
              <div className="about-footer-box">
                <div className="footer-logo">
                  <img src="/images/logo.png" alt="Footer Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
                </div>
                <div className="about-footer-content">
                  <p>Empowering early detection of Cervical cancer for women's health</p>
                </div>
                <div className="footer-social-links">
                  <ul>
                    <li><a href="#"><i className="fa-brands fa-pinterest-p"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-x"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="footer-contact-box">
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