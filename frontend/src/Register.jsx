import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';

const { useAuth } = AuthProvider;
import './assets/css/auth.css';

export const Register = () => {
  const { login, token, apiBaseUrl, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    state: '',
    city: '',
    contact_number: '',
    email: '',
    occupation: '',
    has_cancer: 'no',
    is_aware: 'no',
    has_screening: 'no',
    role: 'user',
  });
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    if (!isLoading && token) {
      navigate('/user');
    }
  }, [token, isLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormFeedback({ message: 'Please fill in all required fields.', type: 'danger' });
      return false;
    }
    if (formData.username.length > 50) {
      setFormFeedback({ message: 'Username must be 50 characters or less.', type: 'danger' });
      return false;
    }
    if (formData.password.length > 128) {
      setFormFeedback({ message: 'Password must be 128 characters or less.', type: 'danger' });
      return false;
    }
    if (formData.email.length > 120) {
      setFormFeedback({ message: 'Email must be 120 characters or less.', type: 'danger' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormFeedback({ message: 'Passwords do not match.', type: 'danger' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormFeedback({ message: 'Please enter a valid email address.', type: 'danger' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const requiredFields = [
      'state', 'city', 'contact_number', 'occupation', 'has_cancer', 'is_aware', 'has_screening',
    ];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        setFormFeedback({ message: `Please fill in ${field.replace('_', ' ')}.`, type: 'danger' });
        return false;
      }
    }
    if (formData.state.length > 100) {
      setFormFeedback({ message: 'State must be 100 characters or less.', type: 'danger' });
      return false;
    }
    if (formData.city.length > 100) {
      setFormFeedback({ message: 'City must be 100 characters or less.', type: 'danger' });
      return false;
    }
    if (formData.contact_number.length > 20) {
      setFormFeedback({ message: 'Contact number must be 20 characters or less.', type: 'danger' });
      return false;
    }
    if (formData.occupation.length > 100) {
      setFormFeedback({ message: 'Occupation must be 100 characters or less.', type: 'danger' });
      return false;
    }
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(formData.contact_number)) {
      setFormFeedback({ message: 'Please enter a valid contact number (10-15 digits).', type: 'danger' });
      return false;
    }
    if (!['yes', 'no'].includes(formData.has_cancer)) {
      setFormFeedback({ message: 'History of cancer must be "yes" or "no".', type: 'danger' });
      return false;
    }
    if (!['yes', 'no'].includes(formData.is_aware)) {
      setFormFeedback({ message: 'Awareness must be "yes" or "no".', type: 'danger' });
      return false;
    }
    if (!['yes', 'no'].includes(formData.has_screening)) {
      setFormFeedback({ message: 'Screening status must be "yes" or "no".', type: 'danger' });
      return false;
    }
    if (formData.role !== 'user') {
      setFormFeedback({ message: 'Role must be user.', type: 'danger' });
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setFormFeedback({ message: '', type: '' });
      setStep(2);
    }
  };

  const handleBack = () => {
    setFormFeedback({ message: '', type: '' });
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormFeedback({ message: '', type: '' });

    if (!validateStep2()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('contact_number', formData.contact_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('occupation', formData.occupation);
      formDataToSend.append('has_cancer', formData.has_cancer);
      formDataToSend.append('is_aware', formData.is_aware);
      formDataToSend.append('has_screening', formData.has_screening);

      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();      if (response.ok && data.success) {
        setFormFeedback({ message: 'Registration successful! Redirecting to login...', type: 'success' });
        // Always redirect to login after successful registration since the user needs to log in first
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setFormFeedback({ message: data.message || 'Registration failed.', type: 'danger' });
      }
    } catch (error) {
      setFormFeedback({ message: 'Network error. Please try again.', type: 'danger' });
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <>
      <Helmet>
        <title>Aiyo Care | Register</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
              max-width: 800px;
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
              max-width: 150px;
              max-height: 50px;
              width: auto;
              height: 50px;
              object-fit: contain;
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
              display: ${formFeedback.message ? 'block' : 'none'};
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
              justify-content: center;
              align-items: center;
            }
            .register-link {
              color: var(--text-color);
              text-decoration: none;
              font-size: 14px;
              transition: color 0.3s ease;
            }
            .register-link:hover {
              color: var(--primary-color);
            }
            .form-check-group {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .form-check-group .form-check {
              flex: 1;
              text-align: center;
            }
            .step-indicator {
              text-align: center;
              margin-bottom: 20px;
              font-size: 16px;
              color: var(--text-color);
            }
            .btn-back {
              width: 100%;
              padding: 12px;
              margin-top: 10px;
              background-color: var(--text-color);
              border-color: var(--text-color);
            }
            .btn-back:hover {
              background-color: var(--primary-color);
              border-color: var(--primary-color);
            }
            input[readonly] {
              background-color: var(--divider-color);
              cursor: not-allowed;
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
                  Register
                </h2>
                <p style={{ fontSize: '14px', padding: '5px 0' }}>
                  Create your account to join Aiyo Care
                </p>
                <div className="step-indicator">Step {step} of 2</div>
              </div>
              <form id="registerForm" onSubmit={step === 1 ? handleNext : handleSubmit} data-aos="fade-up" data-aos-delay="200">
                {formFeedback.message && (
                  <div className={`alert alert-${formFeedback.type}`} role="alert">
                    {formFeedback.message}
                  </div>
                )}
                {step === 1 && (
                  <div className="row">
                    <div className="col-md-6">
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
                          maxLength={50}
                          aria-label="Username"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          maxLength={120}
                          aria-label="Email"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
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
                          maxLength={128}
                          aria-label="Password"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                          maxLength={128}
                          aria-label="Confirm Password"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn-default btn-login" disabled={isSubmitting}>
                        Next
                      </button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="Enter your state"
                          required
                          maxLength={100}
                          aria-label="State"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Enter your city"
                          required
                          maxLength={100}
                          aria-label="City"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="contact_number">Contact Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="contact_number"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          placeholder="Enter your contact number"
                          required
                          maxLength={20}
                          aria-label="Contact Number"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="occupation">Occupation</label>
                        <input
                          type="text"
                          className="form-control"
                          id="occupation"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          placeholder="Enter your occupation"
                          required
                          maxLength={100}
                          aria-label="Occupation"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <input
                          type="text"
                          className="form-control"
                          id="role"
                          name="role"
                          value="user"
                          readOnly
                          required
                          aria-label="Role"
                        />
                        <small style={{ color: 'var(--text-color)', fontSize: '12px' }}>
                          Role is set to User by default. Contact support for other roles.
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Do you have a history of cancer?</label>
                        <div className="form-check-group">
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id="has_cancer_yes"
                              name="has_cancer"
                              value="yes"
                              checked={formData.has_cancer === 'yes'}
                              onChange={handleChange}
                              required
                              aria-label="History of cancer: Yes"
                            />
                            <label className="form-check-label" htmlFor="has_cancer_yes">
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id="has_cancer_no"
                              name="has_cancer"
                              value="no"
                              checked={formData.has_cancer === 'no'}
                              onChange={handleChange}
                              required
                              aria-label="History of cancer: No"
                            />
                            <label className="form-check-label" htmlFor="has_cancer_no">
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Are you aware of cervical cancer?</label>
                        <div className="form-check-group">
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id="is_aware_yes"
                              name="is_aware"
                              value="yes"
                              checked={formData.is_aware === 'yes'}
                              onChange={handleChange}
                              required
                              aria-label="Aware of cervical cancer: Yes"
                            />
                            <label className="form-check-label" htmlFor="is_aware_yes">
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id="is_aware_no"
                              name="is_aware"
                              value="no"
                              checked={formData.is_aware === 'no'}
                              onChange={handleChange}
                              required
                              aria-label="Aware of cervical cancer: No"
                            />
                            <label className="form-check-label" htmlFor="is_aware_no">
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Have you ever been screened?</label>
                        <div className="form-check-group">
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id="has_screening_yes"
                              name="has_screening"
                              value="yes"
                              checked={formData.has_screening === 'yes'}
                              onChange={handleChange}
                              required
                              aria-label="Screened for cervical cancer: Yes"
                            />
                            <label className="form-check-label" htmlFor="has_screening_yes">
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id="has_screening_no"
                              name="has_screening"
                              value="no"
                              checked={formData.has_screening === 'no'}
                              onChange={handleChange}
                              required
                              aria-label="Screened for cervical cancer: No"
                            />
                            <label className="form-check-label" htmlFor="has_screening_no">
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group d-flex">
                      <button type="button" className="btn btn-back me-2" onClick={handleBack}>
                        Back
                      </button>
                      <button type="submit" className="btn-default btn-login" disabled={isSubmitting}>
                        {isSubmitting ? 'Registering...' : 'Register'}
                      </button>
                    </div>
                  </div>
                )}
                <div className="account-links-container">
                  <Link to="/login" className="register-link">
                    Already have an account? Login here
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
                      <a href="tel:+234123456789">(+234) 123456789</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>E-mail:</h3>
                  <ul>
                    <li>
                      <i className="fa-solid fa-envelope"></i>
                      <a href="mailto:domainname@example.com">domainname@example.com</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>Address:</h3>
                  <ul>
                    <li>
                      <i className="fa-solid fa-location-dot"></i>
                      123 High Street LN1 1AB, UK
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