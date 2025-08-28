import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';
import './assets/css/auth.css';

const { useAuth } = AuthProvider;

export const Login = () => {
  const { login, user, apiBaseUrl, csrfToken, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    if (!isLoading && user) {
      // Route based on user role when already logged in
      const roleBasedRoute = {
        user: '/user',
        admin: '/admin',
        provider: '/provider',
      };
      navigate(roleBasedRoute[user.role] || '/');
    }
  }, [user, isLoading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setFormFeedback({ message: 'Please enter both username and password.', type: 'danger' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormFeedback({ message: '', type: '' });

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);

      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        if (!data.user) {
          throw new Error('User data not received from server');
        }

        await login(null, data.user);
        setFormFeedback({ message: data.message || 'Login successful! Redirecting...', type: 'success' });
        
        setTimeout(() => {
          const roleBasedRoute = {
            user: '/user',
            admin: '/admin',
            provider: '/provider',
            doctor: '/provider' // Map doctor role to provider route
          };
          
          const targetRoute = data.user.role ? roleBasedRoute[data.user.role] || '/' : '/';
          navigate(targetRoute, { replace: true });
        }, 1000);
      } else {
        setFormFeedback({ message: data.message || 'Invalid credentials.', type: 'danger' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormFeedback({ message: 'Network error. Please try again.', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <>
      <Helmet>
        <title>Aiyo Care | Login</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=Sora:wght@100..800&display=swap"
          rel="stylesheet"
        />
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/all.min.css" rel="stylesheet" />
        <link href="/css/animate.css" rel="stylesheet" />
        <link href="/css/mousecursor.css" rel="stylesheet" />
        <link href="/css/custom.css" rel="stylesheet" />
        <style>
          {`
            .login-container {
              max-width: 500px;
              margin: 80px auto;
              padding: 40px;
              background-color: var(--white-color);
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .login-logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .login-logo img {
              max-width: 180px;
            }
            .login-title {
              text-align: center;
              margin-bottom: 30px;
            }
            .form-group {
              margin-bottom: 20px;
            }
            .btn-login {
              width: 100%;
              padding: 12px;
              margin-top: 10px;
            }
            .alert {
              margin-top: 20px;
              ${formFeedback.message ? 'display: block;' : 'display: none;'}
            }
            .forgot-password {
              text-align: center;
              margin-top: 10px;
            }
            .bg-login {
              background-color: var(--secondary-color);
              min-height: 100vh;
              padding: 40px 0;
            }
            .form-control::placeholder {
              color: var(--text-color);
              opacity: 0.5;
              transition: opacity 0.3s ease;
            }
            .form-control:focus::placeholder {
              opacity: 0.3;
            }
            .account-links-container {
              text-align: center;
              margin-top: 15px;
              padding: 10px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .forgot-password-link, .register-link {
              color: var(--text-color);
              text-decoration: none;
              font-size: 14px;
              transition: color 0.3s ease;
            }
            .forgot-password-link:hover, .register-link:hover {
              color: var(--primary-color);
            }
          `}
        </style>
      </Helmet>
      <div className="bg-login">
        <div className="container">
          <div className="col-lg-12">
            <div className="login-container wow fadeInUp" data-aos="fade-up">
              <div className="login-logo">
                <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </div>
              <div className="login-title">
                <h2 className="text-anime-style-2" data-cursor="-opaque" data-aos="fade">
                  Login
                </h2>
                <p style={{ fontSize: '14px', padding: '5px 0' }}>
                  Enter your credentials to access the dashboard
                </p>
              </div>
              <form id="loginForm" onSubmit={handleSubmit} data-aos="fadeUp" data-aos-delay="200">
                {formFeedback.message && (
                  <div className={`alert alert-${formFeedback.type}`} role="alert">
                    {formFeedback.message}
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn-default btn-login"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
                <div className="account-links-container">
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                  <Link to="/register" className="register-link">
                    Register New Account
                  </Link>
                </div>
              </form>
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
                      <i className="fa-solid fa-location-dot"></i>
                      123 High Street LN1 1AB Street UK
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