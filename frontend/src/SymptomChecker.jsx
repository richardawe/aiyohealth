import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';

const { useAuth } = AuthProvider;
import { slide as Menu } from 'react-burger-menu';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import './assets/css/auth.css';

export const SymptomChecker = () => {
  const { user, logout, apiBaseUrl, isLoading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 5;
  const [formData, setFormData] = useState({
    // Basic info
    full_name: user?.username || '',
    dob: '',
    age: 0,

    // Required fields
    ethnicity: '',
    ethnicity_other_input: '',
    
    // Primary symptoms
    abnormal_vaginal_bleeding: '',
    bleeding_type: '',
    is_post_coital_or_post_menopausal: 'no',
    abnormal_vaginal_discharge: '',
    lower_abdominal_pain: '',
    
    // Additional symptoms
    dyspareunia: '',
    change_in_periods: '',
    weight_loss: '',
    unusual_fatigue: '',
    
    // Risk factors
    is_pregnant: '',
    sexual_partners: '',
    age_first_intercourse: '',
    oral_contraceptive_use: '',
    contraceptive_years: '',
    smoking: '',
    cigarettes_per_day: '',
    had_pap_smear: '',
    abnormal_pap_smear: 'no',
    hiv_status: '',
    parity: '',
  });
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const progressBarRef = useRef(null);
  const progressTextRef = useRef(null);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Abuja FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
    'Taraba', 'Yobe', 'Zamfara',
  ];
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      console.log('No user session found, redirecting to login');
      navigate('/login');
    }
  }, [user, isLoading]);  useEffect(() => {
    // Only fetch history after we're sure authentication is complete
    if (!isLoading && user) {
      fetchSymptomHistory();
    }
  }, [page, user, isLoading]);

  const fetchSymptomHistory = async () => {
    if (!user) {
      console.log('No user session, skipping symptom history fetch');
      return;
    }

    try {
      console.log('Fetching symptom history with user:', user);
      const response = await fetch(`${apiBaseUrl}/symptom-history?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSymptomHistory(data.data.history);
        setTotalPages(data.data.pagination.total_pages);
      } else {
        setFormFeedback({ message: data.message || 'Failed to fetch symptom history.', type: 'danger' });
      }
    } catch (error) {
      console.error('Error fetching symptom history:', error);
      setFormFeedback({ message: 'Error fetching symptom history.', type: 'danger' });
    }
  };

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'dob') {
        const age = calculateAge(value);
        newData.age = age !== null ? age : 0;
      }
      if (name === 'abnormal_vaginal_bleeding') {
        newData.bleeding_type = value === 'yes' ? prev.bleeding_type : '';
        newData.is_post_coital_or_post_menopausal = value === 'yes' && ['postcoital', 'postmenopausal'].includes(prev.bleeding_type) ? 'yes' : 'no';
      }
      if (name === 'bleeding_type') {
        newData.is_post_coital_or_post_menopausal = ['postcoital', 'postmenopausal'].includes(value) ? 'yes' : 'no';
      }
      if (name === 'ethnicity') {
        newData.ethnicity_other_input = value === 'Other' ? prev.ethnicity_other_input : '';
      }
      if (name === 'oral_contraceptive_use') {
        newData.contraceptive_years = value === 'yes' ? prev.contraceptive_years : '';
      }
      if (name === 'smoking') {
        newData.cigarettes_per_day = ['Current', 'Previous'].includes(value) ? prev.cigarettes_per_day : '';
      }
      if (name === 'had_pap_smear') {
        newData.abnormal_pap_smear = value === 'yes' ? prev.abnormal_pap_smear : 'no';
      }
      if (name === 'hiv_status') {
        newData.hiv_positive = value === 'Positive' ? 'yes' : 'no';
      }
      if (name === 'parity') {
        newData.high_parity = value === '>=5 children' ? 'yes' : 'no';
      }
      return newData;
    });
  };

  const validateSection = (section) => {
    const requiredFields = {
      1: ['full_name'], // Basic info only
      2: ['dob', 'ethnicity'], // Demographics
      3: ['abnormal_vaginal_bleeding', 'abnormal_vaginal_discharge', 'lower_abdominal_pain'], // Primary symptoms
      4: ['dyspareunia', 'change_in_periods', 'weight_loss', 'unusual_fatigue'], // Additional symptoms
      5: ['is_pregnant', 'sexual_partners', 'age_first_intercourse', 'oral_contraceptive_use', 
          'smoking', 'had_pap_smear', 'hiv_status', 'parity'] // Risk factors
    };
    const conditionalFields = {
      ethnicity: ['ethnicity_other_input'],
      abnormal_vaginal_bleeding: ['bleeding_type'],
      oral_contraceptive_use: ['contraceptive_years'],
      smoking: ['cigarettes_per_day'],
      had_pap_smear: ['abnormal_pap_smear']
    };

    const fields = requiredFields[section];
    for (const field of fields) {
      if (!formData[field]) {
        return { isValid: false, message: `Please complete ${field.replace('_', ' ')}.` };
      }
      if (field in conditionalFields && formData[field] === (field === 'ethnicity' ? 'Other' : 'yes')) {
        for (const condField of conditionalFields[field]) {
          if (!formData[condField]) {
            return { isValid: false, message: `Please complete ${condField.replace('_', ' ')}.` };
          }
        }
      }
    }
    if (section === 2 && formData.dob) {
      const age = calculateAge(formData.dob);
      if (age === null || age < 1 || age > 120) {
        return { isValid: false, message: 'Invalid date of birth.' };
      }
    }
    return { isValid: true };
  };

  const calculateAge = (dob) => {
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
  };

  const showSection = (section) => {
    if (section > currentSection) {
      const validation = validateSection(currentSection);
      if (!validation.isValid) {
        setFormFeedback({ message: validation.message, type: 'danger' });
        return;
      }
    }
    setFormFeedback({ message: '', type: '' });
    setCurrentSection(section);
    const progress = (section / totalSections) * 100;
    if (progressBarRef.current && progressTextRef.current) {
      progressBarRef.current.style.width = `${progress}%`;
      progressTextRef.current.textContent = `${Math.round(progress)}% Complete`;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setFormFeedback({ message: 'Please log in to submit symptoms.', type: 'danger' });
      return;
    }

    const validation = validateSection(currentSection);
    if (!validation.isValid) {
      setFormFeedback({ message: validation.message, type: 'danger' });
      return;
    }

    setIsSubmitting(true);
    try {      const response = await fetch(`${apiBaseUrl}/symptom-checker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setResults({
          full_name: formData.full_name,
          age: formData.age,
          risk_score: data.data.risk_score,
          risk_category: data.data.risk_category,
          scenario: data.data.scenario,
          predefined_recommendations: data.data.predefined_recommendations,
          personalized_recommendations: data.data.personalized_recommendations
        });
        setFormFeedback({ message: data.message, type: 'success' });
        if (progressBarRef.current && progressTextRef.current) {
          progressBarRef.current.style.width = '100%';
          progressTextRef.current.textContent = 'Assessment Complete';
        }
        await fetchSymptomHistory();
      } else {
        setFormFeedback({ message: data.message || 'Failed to process symptoms.', type: 'danger' });
      }
    } catch (error) {
      console.error('Error submitting symptoms:', error);
      setFormFeedback({ message: 'Error submitting symptoms. Please try again.', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGeneratePDF = () => {
    try {
      // Create a new window for PDF content
      const printWindow = window.open('', '', 'height=800,width=800');
      
      // Generate the HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cervical Cancer Risk Assessment Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
              color: var(--text-color);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid var(--text-color);
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .risk-score {
              font-size: 24px;
              color: var(--error-color);
              font-weight: bold;
            }
            .risk-category {
              font-size: 20px;
              margin: 10px 0;
              padding: 5px 10px;
              display: inline-block;
            }
            .risk-category.low { color: #27ae60; }
            .risk-category.moderate { color: #f39c12; }
            .risk-category.high { color: var(--error-color); }
            .recommendations {
              background: var(--secondary-color);
              padding: 15px;
              border-radius: 5px;
            }
            .warning {
              margin-top: 20px;
              font-style: italic;
              color: var(--text-color);
            }
            .date {
              text-align: right;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cervical Cancer Risk Assessment Report</h1>
            <p>Generated for: ${results.full_name}</p>
          </div>

          <div class="section">
            <h2>Assessment Results</h2>
            <p><strong>Age:</strong> ${results.age}</p>
            <p class="risk-score">Risk Score: ${results.risk_score}%</p>
            <p class="risk-category ${results.risk_category.toLowerCase()}">${results.risk_category} Risk Category</p>
          </div>

          <div class="section">
            <h3>Scenario:</h3>
            <p>${results.scenario}</p>
          </div>

          <div class="section recommendations">
            <h3>Recommended Actions:</h3>
            <p>${results.predefined_recommendations}</p>
            <h4>Personalized Recommendations:</h4>
            <ul>
              ${results.personalized_recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>

          <div class="warning">
            <p><strong>Important Note:</strong> This assessment is for informational purposes only and does not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</p>
          </div>          <div class="date">
            <p>Generated on: ${new Date().toLocaleDateString('en-NG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Africa/Lagos'
            })}</p>
          </div>
        </body>
        </html>
      `;

      // Write the content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = function() {
        printWindow.print();
        // Close the window after print dialog is closed
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      };

      setFormFeedback({ message: 'PDF generation initiated! Please use your browser\'s print dialog to save as PDF.', type: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setFormFeedback({ message: 'Error generating PDF report.', type: 'danger' });
    }
  };
  const resetForm = () => {
    setFormData({
      // Basic info
      full_name: user?.username || '',
      dob: '',
      age: 0,

      // Required fields
      ethnicity: '',
      ethnicity_other_input: '',
      
      // Primary symptoms
      abnormal_vaginal_bleeding: '',
      bleeding_type: '',
      is_post_coital_or_post_menopausal: 'no',
      abnormal_vaginal_discharge: '',
      lower_abdominal_pain: '',
      
      // Additional symptoms
      dyspareunia: '',
      change_in_periods: '',
      weight_loss: '',
      unusual_fatigue: '',
      
      // Risk factors
      is_pregnant: '',
      sexual_partners: '',
      age_first_intercourse: '',
      oral_contraceptive_use: '',
      contraceptive_years: '',
      smoking: '',
      cigarettes_per_day: '',
      had_pap_smear: '',
      abnormal_pap_smear: 'no',
      hiv_status: '',
      parity: ''
    });
    setResults(null);
    setCurrentSection(1);
    setFormFeedback({ message: '', type: '' });
    if (progressBarRef.current && progressTextRef.current) {
      progressBarRef.current.style.width = '0%';
      progressTextRef.current.textContent = '0% Complete';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const handleShowHistoryModal = () => {
    if (!user) {
      setFormFeedback({ message: 'Please log in to view history', type: 'danger' });
      return;
    }
    setShowHistoryModal(true);
    fetchSymptomHistory();
  };

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Symptom Checker</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="shortcut icon" href="/images/favicon.png" />
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
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item"><Link className="nav-link" to="/user">Home</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/symptom-checker">Symptom Checker</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/medical-history">Medical History</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/screening-recommendations">Screening Recommendations</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/health-resources">Resource Portal</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/profile-settings">Profile Settings</Link></li>
                  </ul>
                </div>
                <div className="header-contact-btn">
                  <a href="tel:123456789" className="header-contact-now">
                    <i className="fa-solid fa-phone"></i>(+234) 123456789
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
              <div onClick={closeMenu}><Link to="/screening-recommendations">Screening Recommendations</Link></div>
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
                <h1 className="text-anime-style-3" data-cursor="-opaque">Symptom Checker</h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/user">User Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Symptom Checker</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-book-appointment">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="appointment-form">
                <div className="section-title">
                  <h3 data-aos="fadeInUp">Cervical Cancer Risk Assessment Tool</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade">Log Your Symptoms</h2>
                  <p data-aos="fadeUp" data-aos-delay="200">
                    Designed to promote preventive healthcare for women. Required fields are marked with *.
                  </p>
                </div>
          <div className="history-buttons" data-aos="fadeUp" data-aos-delay="300">
                  <Button className="btn-default" onClick={handleShowHistoryModal}>
                    <i className="fa-solid fa-history"></i> View Symptom History
                  </Button>
                </div>
                <div className="progress-bar-container" data-aos="fadeUp" data-aos-delay="300">
                  <div className="progress-bar" ref={progressBarRef}></div>
                  <div className="progress-text" ref={progressTextRef}>0% Complete</div>
                </div>
                {results ? (
                  <div className="results-card" data-aos="fade-up">
                    <h2>Assessment Results</h2>
                    <p><strong>Full Name:</strong> {results.full_name}</p>
                    <p><strong>Age:</strong> {results.age}</p>
                    <h3>Risk Percentage: <span className="risk-percentage">{results.risk_score}%</span></h3>
                    <h3>Risk Category: <span className={`risk-category ${results.risk_category.toLowerCase()}`}>{results.risk_category}</span></h3>
                    <h4>Scenario:</h4>
                    <p>{results.scenario}</p>
                    <h4>Predefined Recommendations:</h4>
                    <p>{results.predefined_recommendations}</p>
                    <h4>Personalized Recommendations:</h4>
                    <ul>
                      {results.personalized_recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                    <div className="warning">
                      <p><strong>Important:</strong> This tool is for informational purposes only and does not replace medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</p>
                    </div>
                    <div className="actions">
                      <Button className="btn-default" onClick={handleGeneratePDF} disabled={isSubmitting}>
                        {isSubmitting ? 'Generating...' : 'Generate PDF Report'}
                      </Button>
                      <Button variant="outline-primary" onClick={resetForm}>Back to Assessment</Button>
                    </div>
                  </div>
                ) : (
                  <Form id="symptomForm" onSubmit={handleSubmit} data-aos="fadeUp">
                    <div className={`form-section ${currentSection === 1 ? 'active' : ''}`} id="section1">
                      <h4>Basic Information</h4>
                      <Form.Group className="mb-4">
                        <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                          aria-label="Full Name"
                          aria-required="true"
                        />
                        <Form.Control.Feedback type="invalid">Please enter your full name.</Form.Control.Feedback>
                      </Form.Group>
                      <div className="form-navigation">
                        <Button variant="outline-secondary" disabled>Previous</Button>
                        <Button variant="primary" className="ms-2" onClick={() => showSection(2)}>Next</Button>
                      </div>
                    </div>
                    <div className={`form-section ${currentSection === 2 ? 'active' : ''}`} id="section2">
                      <h4>Demographic Information</h4>
                      <Form.Group className="mb-4">
                        <Form.Label>Date of Birth <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          required
                          aria-label="Date of Birth"
                          aria-required="true"
                        />
                        <Form.Control.Feedback type="invalid">Please enter your date of birth.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Ethnicity <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="ethnicity"
                          value={formData.ethnicity}
                          onChange={handleChange}
                          required
                          aria-label="Ethnicity"
                          aria-required="true"
                        >
                          <option value="">Select Ethnicity</option>
                          <option value="Hausa">Hausa</option>
                          <option value="Yoruba">Yoruba</option>
                          <option value="Igbo">Igbo</option>
                          <option value="Fulani">Fulani</option>
                          <option value="Kanuri">Kanuri</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select your ethnicity.</Form.Control.Feedback>
                        {formData.ethnicity === 'Other' && (
                          <Form.Group className="mt-2">
                            <Form.Label>Specify Ethnicity <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="ethnicity_other_input"
                              value={formData.ethnicity_other_input}
                              onChange={handleChange}
                              required
                              aria-label="Other Ethnicity"
                              aria-required="true"
                            />
                            <Form.Control.Feedback type="invalid">Please specify your ethnicity.</Form.Control.Feedback>
                          </Form.Group>
                        )}
                      </Form.Group>
                      <div className="form-navigation">
                        <Button variant="outline-secondary" onClick={() => showSection(1)}>Previous</Button>
                        <Button variant="primary" className="ms-2" onClick={() => showSection(3)}>Next</Button>
                      </div>
                    </div>
                    <div className={`form-section ${currentSection === 3 ? 'active' : ''}`} id="section3">
                      <h4>Primary Symptoms</h4>
                      <Form.Group className="mb-4">
                        <Form.Label>Do you have abnormal vaginal bleeding? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="abnormal_vaginal_bleeding"
                            id="bleedingYes"
                            value="yes"
                            checked={formData.abnormal_vaginal_bleeding === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Abnormal Vaginal Bleeding: Yes"
                          />
                          <Form.Label htmlFor="bleedingYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="abnormal_vaginal_bleeding"
                            id="bleedingNo"
                            value="no"
                            checked={formData.abnormal_vaginal_bleeding === 'no'}
                            onChange={handleChange}
                            aria-label="Abnormal Vaginal Bleeding: No"
                          />
                          <Form.Label htmlFor="bleedingNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                        {formData.abnormal_vaginal_bleeding === 'yes' && (
                          <Form.Group className="mt-2">
                            <Form.Label>Type of Bleeding <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                              name="bleeding_type"
                              value={formData.bleeding_type}
                              onChange={handleChange}
                              required
                              aria-label="Type of Bleeding"
                              aria-required="true"
                            >
                              <option value="">Select Type</option>
                              <option value="intermenstrual">Intermenstrual</option>
                              <option value="postcoital">Post-coital</option>
                              <option value="heavier">Heavier Periods</option>
                              <option value="postmenopausal">Postmenopausal</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please select a type.</Form.Control.Feedback>
                          </Form.Group>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Do you have abnormal vaginal discharge? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="abnormal_vaginal_discharge"
                            id="dischargeYes"
                            value="yes"
                            checked={formData.abnormal_vaginal_discharge === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Abnormal Vaginal Discharge: Yes"
                          />
                          <Form.Label htmlFor="dischargeYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="abnormal_vaginal_discharge"
                            id="dischargeNo"
                            value="no"
                            checked={formData.abnormal_vaginal_discharge === 'no'}
                            onChange={handleChange}
                            aria-label="Abnormal Vaginal Discharge: No"
                          />
                          <Form.Label htmlFor="dischargeNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Do you have lower abdominal pain? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="lower_abdominal_pain"
                            id="painYes"
                            value="yes"
                            checked={formData.lower_abdominal_pain === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Lower Abdominal Pain: Yes"
                          />
                          <Form.Label htmlFor="painYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="lower_abdominal_pain"
                            id="painNo"
                            value="no"
                            checked={formData.lower_abdominal_pain === 'no'}
                            onChange={handleChange}
                            aria-label="Lower Abdominal Pain: No"
                          />
                          <Form.Label htmlFor="painNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <div className="form-navigation">
                        <Button variant="outline-secondary" onClick={() => showSection(2)}>Previous</Button>
                        <Button variant="primary" className="ms-2" onClick={() => showSection(4)}>Next</Button>
                      </div>
                    </div>
                    <div className={`form-section ${currentSection === 4 ? 'active' : ''}`} id="section4">
                      <h4>Additional Symptoms</h4>
                      <Form.Group className="mb-4">
                        <Form.Label>Is sexual intercourse painful? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="dyspareunia"
                            id="dyspareuniaYes"
                            value="yes"
                            checked={formData.dyspareunia === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Painful Intercourse: Yes"
                          />
                          <Form.Label htmlFor="dyspareuniaYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="dyspareunia"
                            id="dyspareuniaNo"
                            value="no"
                            checked={formData.dyspareunia === 'no'}
                            onChange={handleChange}
                            aria-label="Painful Intercourse: No"
                          />
                          <Form.Label htmlFor="dyspareuniaNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Are you experiencing changes in menstrual periods? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="change_in_periods"
                            id="periodsYes"
                            value="yes"
                            checked={formData.change_in_periods === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Changes in Periods: Yes"
                          />
                          <Form.Label htmlFor="periodsYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="change_in_periods"
                            id="periodsNo"
                            value="no"
                            checked={formData.change_in_periods === 'no'}
                            onChange={handleChange}
                            aria-label="Changes in Periods: No"
                          />
                          <Form.Label htmlFor="periodsNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Are you experiencing unexplained weight loss? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="weight_loss"
                            id="weightLossYes"
                            value="yes"
                            checked={formData.weight_loss === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Weight Loss: Yes"
                          />
                          <Form.Label htmlFor="weightLossYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="weight_loss"
                            id="weightLossNo"
                            value="no"
                            checked={formData.weight_loss === 'no'}
                            onChange={handleChange}
                            aria-label="Weight Loss: No"
                          />
                          <Form.Label htmlFor="weightLossNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">                        <Form.Label>Are you experiencing unusual fatigue? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="unusual_fatigue"
                            id="fatigueYes"
                            value="yes"
                            checked={formData.unusual_fatigue === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Unusual Fatigue: Yes"
                          />
                          <Form.Label htmlFor="fatigueYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="unusual_fatigue"
                            id="fatigueNo"
                            value="no"
                            checked={formData.unusual_fatigue === 'no'}
                            onChange={handleChange}
                            aria-label="Unusual Fatigue: No"
                          />
                          <Form.Label htmlFor="fatigueNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <div className="form-navigation">
                        <Button variant="outline-secondary" onClick={() => showSection(3)}>Previous</Button>
                        <Button variant="primary" className="ms-2" onClick={() => showSection(5)}>Next</Button>
                      </div>
                    </div>
                    <div className={`form-section ${currentSection === 5 ? 'active' : ''}`} id="section5">
                      <h4>Risk Factors</h4>
                      <Form.Group className="mb-4">
                        <Form.Label>Are you currently pregnant? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="is_pregnant"
                            id="pregnantYes"
                            value="yes"
                            checked={formData.is_pregnant === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Pregnant: Yes"
                          />
                          <Form.Label htmlFor="pregnantYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="is_pregnant"
                            id="pregnantNo"
                            value="no"
                            checked={formData.is_pregnant === 'no'}
                            onChange={handleChange}
                            aria-label="Pregnant: No"
                          />
                          <Form.Label htmlFor="pregnantNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Number of sexual partners in lifetime? <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="sexual_partners"
                          value={formData.sexual_partners}
                          onChange={handleChange}
                          required
                          aria-label="Number of Sexual Partners"
                          aria-required="true"
                        >
                          <option value="">Select</option>
                          <option value="0">0</option>
                          <option value="1–3">1–3</option>
                          <option value="4–7">4–7</option>
                          <option value=">8">8+</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Age at first intercourse? <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="age_first_intercourse"
                          value={formData.age_first_intercourse}
                          onChange={handleChange}
                          required
                          aria-label="Age at First Intercourse"
                          aria-required="true"
                        >
                          <option value="">Select</option>
                          <option value="<16 years"> less than 16 years</option>
                          <option value="16–20 years">16–20 years</option>
                          <option value=">21 years">21+ years</option>
                          <option value="Not applicable">Not applicable</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Have you used hormonal contraceptives? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="oral_contraceptive_use"
                            id="contraceptiveYes"
                            value="yes"
                            checked={formData.oral_contraceptive_use === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Contraceptive Use: Yes"
                          />
                          <Form.Label htmlFor="contraceptiveYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="oral_contraceptive_use"
                            id="contraceptiveNo"
                            value="no"
                            checked={formData.oral_contraceptive_use === 'no'}
                            onChange={handleChange}
                            aria-label="Contraceptive Use: No"
                          />
                          <Form.Label htmlFor="contraceptiveNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                        {formData.oral_contraceptive_use === 'yes' && (
                          <Form.Group className="mt-2">
                            <Form.Label>Duration of use <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                              name="contraceptive_years"
                              value={formData.contraceptive_years}
                              onChange={handleChange}
                              required
                              aria-label="Contraceptive Duration"
                              aria-required="true"
                            >
                              <option value="">Select</option>
                              <option value="<5 years">less than 5 years</option>
                              <option value="5–9 years">5–9 years</option>
                              <option value=">10 years">10+ years</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                          </Form.Group>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Do you smoke? <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="smoking"
                          value={formData.smoking}
                          onChange={handleChange}
                          required
                          aria-label="Smoking Status"
                          aria-required="true"
                        >
                          <option value="">Select</option>
                          <option value="Never">Never</option>
                          <option value="Current">Current</option>
                          <option value="Previous">Previous</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                        {['Current', 'Previous'].includes(formData.smoking) && (
                          <Form.Group className="mt-2">
                            <Form.Label>Cigarettes per day <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                              name="cigarettes_per_day"
                              value={formData.cigarettes_per_day}
                              onChange={handleChange}
                              required
                              aria-label="Cigarettes per Day"
                              aria-required="true"
                            >
                              <option value="">Select</option>
                              <option value="1–9">1–9</option>
                              <option value="10–19">10–19</option>
                              <option value=">20">20+</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                          </Form.Group>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Have you had a pap smear, HPV test, or VIA test? <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex">
                          <Form.Check
                            type="radio"
                            name="had_pap_smear"
                            id="papSmearYes"
                            value="yes"
                            checked={formData.had_pap_smear === 'yes'}
                            onChange={handleChange}
                            required
                            className="me-2"
                            aria-label="Pap Smear: Yes"
                          />
                          <Form.Label htmlFor="papSmearYes" className="me-4">Yes</Form.Label>
                          <Form.Check
                            type="radio"
                            name="had_pap_smear"
                            id="papSmearNo"
                            value="no"
                            checked={formData.had_pap_smear === 'no'}
                            onChange={handleChange}
                            aria-label="Pap Smear: No"
                          />
                          <Form.Label htmlFor="papSmearNo">No</Form.Label>
                        </div>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                        {formData.had_pap_smear === 'yes' && (
                          <Form.Group className="mt-2">
                            <Form.Label>Result of test <span className="text-danger">*</span></Form.Label>
                            <div className="d-flex">
                              <Form.Check
                                type="radio"
                                name="abnormal_pap_smear"
                                id="papResultNormal"
                                value="no"
                                checked={formData.abnormal_pap_smear === 'no'}
                                onChange={handleChange}
                                required
                                className="me-2"
                                aria-label="Pap Smear Result: Normal"
                              />
                              <Form.Label htmlFor="papResultNormal" className="me-4">Normal</Form.Label>
                              <Form.Check
                                type="radio"
                                name="abnormal_pap_smear"
                                id="papResultAbnormal"
                                value="yes"
                                checked={formData.abnormal_pap_smear === 'yes'}
                                onChange={handleChange}
                                aria-label="Pap Smear Result: Abnormal"
                              />
                              <Form.Label htmlFor="papResultAbnormal">Abnormal</Form.Label>
                            </div>
                            <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                          </Form.Group>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>What is your HIV status? <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="hiv_status"
                          value={formData.hiv_status}
                          onChange={handleChange}
                          required
                          aria-label="HIV Status"
                          aria-required="true"
                        >
                          <option value="">Select</option>
                          <option value="Negative">Negative</option>
                          <option value="Positive">Positive</option>
                          <option value="Unknown">Unknown</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>How many children have you given birth to? <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="parity"
                          value={formData.parity}
                          onChange={handleChange}
                          required
                          aria-label="Parity"
                          aria-required="true"
                        >
                          <option value="">Select</option>
                          <option value="<5 children">less than 5 children</option>
                          <option value=">=5 children">≥5 children</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>What is your marital status? <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="marital_status"
                          value={formData.marital_status}
                          onChange={handleChange}
                          required
                          aria-label="Marital Status"
                          aria-required="true"
                        >
                          <option value="">Select</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select an option.</Form.Control.Feedback>
                      </Form.Group>
                      <div className="form-navigation">
                        <Button variant="outline-secondary" onClick={() => showSection(4)}>Previous</Button>
                        <Button type="submit" variant="primary" className="ms-2" disabled={isSubmitting}>
                          {isSubmitting ? 'Submitting...' : 'Calculate Risk'}
                        </Button>
                      </div>
                    </div>
                    {formFeedback.message && (
                      <Alert variant={formFeedback.type} className="mt-3" role="alert">
                        {formFeedback.message}
                      </Alert>
                    )}
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" className="history-modal">
        <Modal.Header closeButton>
          <Modal.Title>Symptom History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="symptomHistoryContainer">
            {symptomHistory.length === 0 ? (
              <p>No symptom history available.</p>
            ) : (
              symptomHistory.map((entry) => (
                <div className="symptom-history-card" key={entry.id}>
                  <div className="symptom-history-date">
                    {new Date(entry.logged_at).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
                  </div>
                  <div className="symptom-detail">
                    <span className="symptom-label">Abnormal Vaginal Bleeding:</span>
                    <span className={`symptom-value ${entry.abnormal_vaginal_bleeding === 'yes' ? 'symptom-highlight' : ''}`}>
                      {entry.abnormal_vaginal_bleeding === 'yes' ? `Yes (${entry.bleeding_type || 'N/A'})` : 'No'}
                    </span>
                  </div>
                  <div className="symptom-detail">
                    <span className="symptom-label">Abnormal Vaginal Discharge:</span>
                    <span className={`symptom-value ${entry.abnormal_vaginal_discharge === 'yes' ? 'symptom-highlight' : ''}`}>
                      {entry.abnormal_vaginal_discharge === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="symptom-detail">
                    <span className="symptom-label">Lower Abdominal Pain:</span>
                    <span className={`symptom-value ${entry.lower_abdominal_pain === 'yes' ? 'symptom-highlight' : ''}`}>
                      {entry.lower_abdominal_pain === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="symptom-detail">
                    <span className="symptom-label">Painful Intercourse:</span>
                    <span className={`symptom-value ${entry.dyspareunia === 'yes' ? 'symptom-highlight' : ''}`}>
                      {entry.dyspareunia === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="symptom-detail">
                    <span className="symptom-label">Risk Score:</span>
                    <span className="symptom-value">{entry.risk_score}%</span>
                  </div>
                  <div className="symptom-detail">
                    <span className="symptom-label">Risk Category:</span>
                    <span className={`symptom-value ${entry.risk_category.toLowerCase()}`}>{entry.risk_category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination-controls mt-3 d-flex justify-content-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="me-2"
              >
                Previous
              </Button>
              <span className="align-self-center">Page {page} of {totalPages}</span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="ms-2"
              >
                Next
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <footer className="main-footer bg-section dark-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12">
              <div className="about-footer">
                <div className="footer-logo">
                  <img src="/images/logo.png" alt="Footer Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
                </div>
                <div className="about-footer-content">
                  <p>Empowering early detection of cervical cancer for women's health</p>
                </div>
                <div className="footer-social-links">
                  <ul>
                    <li><a href="#" aria-label="Pinterest"><i className="fa-brands fa-pinterest-p"></i></a></li>
                    <li><a href="#" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a></li>
                    <li><a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a></li>
                    <li><a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a></li>
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
                  <p>Copyright © 2025 Aiyo Care. All Rights Reserved.</p>
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