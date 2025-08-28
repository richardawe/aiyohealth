import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';

const { useAuth } = AuthProvider;
import './assets/css/auth.css';

export const Profile = () => {
  const { user, apiBaseUrl, csrfToken, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({ user: null, history: [], assessment_exists: false });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    state: '',
    city: '',
    contact_number: '',
    occupation: '',
    has_cancer: 'no',
    is_aware: 'no',
    has_screening: 'no',
    current_password: '',
    new_password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, isLoading, navigate]);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${apiBaseUrl}/profile`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        // User not authenticated, redirect to login
        navigate('/login');
        return;
      }
      
      if (response.status === 403) {
        // Assessment not completed, redirect to home
        setFormFeedback({ message: data.message || 'Please complete the symptom assessment first.', type: 'warning' });
        navigate('/home');
        return;
      }
      
      if (data.success) {
        setProfileData({
          user: data.user,
          history: data.history,
          assessment_exists: data.assessment_exists,
        });
        setFormData({
          username: data.user.username || '',
          email: data.user.email || '',
          state: data.user.state || '',
          city: data.user.city || '',
          contact_number: data.user.contact_number || '',
          occupation: data.user.occupation || '',
          has_cancer: data.user.has_cancer || 'no',
          is_aware: data.user.is_aware || 'no',
          has_screening: data.user.has_screening || 'no',
          current_password: '',
          new_password: '',
        });
      } else {
        setFormFeedback({ message: data.message || 'Failed to load profile.', type: 'danger' });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setFormFeedback({ message: 'Network error. Please try again.', type: 'danger' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.match(/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/)) errors.email = 'Invalid email format';
    if (formData.new_password && formData.new_password.length < 8) {
      errors.new_password = 'New password must be at least 8 characters';
    }
    if (formData.new_password && !formData.current_password) {
      errors.current_password = 'Current password is required to change password';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormFeedback({ message: '', type: '' });

    // Only include password fields if new_password is provided
    let submitData = { ...formData };
    if (!formData.new_password) {
      delete submitData.current_password;
      delete submitData.new_password;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/profile-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      
      if (data.success) {
        setFormFeedback({ message: 'Profile updated successfully!', type: 'success' });
        setProfileData((prev) => ({ ...prev, user: data.user }));
        setFormData((prev) => ({ ...prev, current_password: '', new_password: '' }));
      } else {
        setFormFeedback({ message: data.message || 'Failed to update profile.', type: 'danger' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setFormFeedback({ message: 'Network error. Please try again.', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading || isLoadingProfile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Health Profile</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="shortcut icon" href="/images/favicon.png" />
      </Helmet>
      <header className="main-header">
        <div className="header-sticky bg-section">
          <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
              <a className="navbar-brand" href="/home">
                <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </a>
              <div className="collapse navbar-collapse main-menu">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav mr-auto" id="menu">
                    <li className="nav-item"><a className="nav-link" href="/home">Home</a></li>
                    <li className="nav-item"><a className="nav-link" href="/symptom-checker">Symptom Checker</a></li>
                    <li className="nav-item"><a className="nav-link" href="/medical-history">Medical History</a></li>
                    <li className="nav-item"><a className="nav-link" href="/screening-recommendations">Screening Portal</a></li>
                    <li className="nav-item"><a className="nav-link" href="/health-resources">Resource Portal</a></li>
                    <li className="nav-item"><a className="nav-link" href="/profile-settings">Profile Settings</a></li>
                  </ul>
                </div>
                <div className="header-contact-btn">
                  <a href="tel:123456789" className="header-contact-now"><i className="fa-solid fa-phone"></i>(+22) 123 456 789</a>
                  <a href="#" className="btn-default" onClick={() => { localStorage.removeItem('userToken'); navigate('/login'); }}>Log Out</a>
                </div>
              </div>
              <div className="navbar-toggle"></div>
            </div>
          </nav>
          <div className="responsive-menu"></div>
        </div>
      </header>
      {/* Health Profile Section */}
      <div className="page-book-appointment">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="appointment-form">
                <div className="section-title">
                  <h3 className="wow fadeInUp">health profile</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Update Your Demographics</h2>
                </div>
                {formFeedback.message && (
                  <div className={`alert alert-${formFeedback.type}`} role="alert">
                    {formFeedback.message}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="wow fadeInUp">
                  <div className="row">
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className="form-control"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="form-control"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        id="contact_number"
                        name="contact_number"
                        className="form-control"
                        placeholder="Contact Number"
                        value={formData.contact_number}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        id="occupation"
                        name="occupation"
                        className="form-control"
                        placeholder="Occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <label>Has Cancer?</label>
                      <select
                        className="form-control form-select"
                        id="has_cancer"
                        name="has_cancer"
                        value={formData.has_cancer}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <label>Is Aware of Cervical Cancer?</label>
                      <select
                        className="form-control form-select"
                        id="is_aware"
                        name="is_aware"
                        value={formData.is_aware}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <label>Has Screening?</label>
                      <select
                        className="form-control form-select"
                        id="has_screening"
                        name="has_screening"
                        value={formData.has_screening}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        className={`form-control ${formErrors.current_password ? 'is-invalid' : ''}`}
                        placeholder="Current Password (for password change)"
                        value={formData.current_password}
                        onChange={handleChange}
                      />
                      {formErrors.current_password && <div className="invalid-feedback">{formErrors.current_password}</div>}
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        className={`form-control ${formErrors.new_password ? 'is-invalid' : ''}`}
                        placeholder="New Password"
                        value={formData.new_password}
                        onChange={handleChange}
                      />
                      {formErrors.new_password && <div className="invalid-feedback">{formErrors.new_password}</div>}
                    </div>
                    <div className="col-lg-12">
                      <div className="contact-form-btn">
                        <button type="submit" className="btn-default" disabled={isSubmitting}>
                          {isSubmitting ? 'Updating...' : 'Save Profile'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="our-appointment-content">
                <div className="section-title">
                  <h3 className="wow fadeInUp">current profile</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Your Demographics</h2>
                </div>
                <div className="appointment-content-body">
                  <div className="appointment-item wow fadeInUp" data-wow-delay="0.2s">
                    <div className="appointment-item-content">
                      <h3>Current Information</h3>
                      <p><strong>Username:</strong> {profileData.user?.username || '-'}</p>
                      <p><strong>Email:</strong> {profileData.user?.email || '-'}</p>
                      <p><strong>State:</strong> {profileData.user?.state || '-'}</p>
                      <p><strong>City:</strong> {profileData.user?.city || '-'}</p>
                      <p><strong>Contact Number:</strong> {profileData.user?.contact_number || '-'}</p>
                      <p><strong>Occupation:</strong> {profileData.user?.occupation || '-'}</p>
                      <p><strong>Has Cancer:</strong> {profileData.user?.has_cancer || '-'}</p>
                      <p><strong>Is Aware of Cervical Cancer:</strong> {profileData.user?.is_aware || '-'}</p>
                      <p><strong>Has Screening:</strong> {profileData.user?.has_screening || '-'}</p>
                      {/* Demographics from latest history */}
                      {profileData.history && profileData.history.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                          <h4>Demographics</h4>
                          <p><strong>Name:</strong> {profileData.history[0].full_name || '-'}</p>
                          <p><strong>Age:</strong> {profileData.history[0].age || '-'}</p>
                          <p><strong>Gender:</strong> {profileData.history[0].gender || '-'}</p>
                          <p><strong>Ethnicity:</strong> {profileData.history[0].ethnicity || '-'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Back Link */}
      <div className="container">
        <a href="/home" className="btn-default" style={{ margin: '20px 0', display: 'inline-block' }}>Back to Dashboard</a>
      </div>
    </>
  );
};

export const ProfileSettings = Profile;