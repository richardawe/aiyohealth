import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Preloader } from "./components/Preloader.jsx";
import AuthProvider from './components/AuthProvider';

const { useAuth } = AuthProvider;
import { slide as Menu } from "react-burger-menu";
import { Modal, Button } from "react-bootstrap";
import "./assets/css/auth.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Added Bootstrap CSS

export const Customization = () => {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [editingItemId, setEditingItemId] = useState(null);
  // Fixed: Added missing fields for thresholds
  const [formData, setFormData] = useState({
    questionText: "",
    type: "radio",
    options: ["", ""],
    category: "symptom",
    isRequired: true,
    parameter: "Risk Score",
    thresholdValue: "",
    action: "",
  });
  const [settings, setSettings] = useState([
    {
      id: "1",
      questionText: "Are you experiencing abnormal vaginal bleeding?",
      type: "radio",
      options: ["Yes", "No"],
      category: "symptom",
      isRequired: true,
      dateUpdated: "April 10, 2025",
    },
    {
      id: "2",
      questionText: "Do you have abnormal vaginal discharge?",
      type: "radio",
      options: ["Yes", "No"],
      category: "symptom",
      isRequired: true,
      dateUpdated: "March 15, 2025",
    },
  ]);
  const [thresholds, setThresholds] = useState([
    {
      id: "1",
      parameter: "Risk Score",
      thresholdValue: 0.7,
      action: "Recommend immediate consultation",
      dateUpdated: "April 5, 2025",
    },
  ]);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    AOS.init();
  }, []);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setEditingItemId(null);
    // Reset formData based on tab
    setFormData({
      questionText: "",
      type: "radio",
      options: ["", ""],
      category: "symptom",
      isRequired: true,
      parameter: "Risk Score",
      thresholdValue: "",
      action: "",
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index) => {
    setFormData((prev) => {
      const newOptions = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: newOptions.length ? newOptions : [""] };
    });
  };

  const validateForm = () => {
    const { questionText, type, options, category, thresholdValue } = formData;
    if (activeTab === "questions") {
      if (!questionText || !category) {
        setError("Question text and category are required.");
        return false;
      }
      if (type !== "text" && options.some((opt) => !opt.trim())) {
        setError("All options must be filled.");
        return false;
      }
    } else if (activeTab === "thresholds") {
      if (!thresholdValue || isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 1) {
        setError("Threshold value must be a number between 0 and 1.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    const dateUpdated = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (activeTab === "questions") {
      const newQuestion = {
        id: editingItemId || Date.now().toString(),
        ...formData,
        dateUpdated,
      };
      setSettings((prev) =>
        editingItemId
          ? prev.map((item) => (item.id === editingItemId ? newQuestion : item))
          : [...prev, newQuestion]
      );
    } else if (activeTab === "thresholds") {
      const newThreshold = {
        id: editingItemId || Date.now().toString(),
        parameter: formData.parameter,
        thresholdValue: parseFloat(formData.thresholdValue),
        action: formData.action || "Recommend consultation",
        dateUpdated,
      };
      setThresholds((prev) =>
        editingItemId
          ? prev.map((item) => (item.id === editingItemId ? newThreshold : item))
          : [...prev, newThreshold]
      );
    }

    setFormData({
      questionText: "",
      type: "radio",
      options: ["", ""],
      category: "symptom",
      isRequired: true,
      parameter: "Risk Score",
      thresholdValue: "",
      action: "",
    });
    setEditingItemId(null);
    alert(`${activeTab === "questions" ? "Question" : "Threshold"} saved successfully!`);
  };

  const handleEdit = (itemId, type) => {
    if (type === "questions") {
      const item = settings.find((s) => s.id === itemId);
      if (item) {
        setFormData({
          questionText: item.questionText,
          type: item.type,
          options: item.options,
          category: item.category,
          isRequired: item.isRequired,
          parameter: "",
          thresholdValue: "",
          action: "",
        });
        setEditingItemId(itemId);
        handleTabSwitch("questions");
      }
    } else if (type === "thresholds") {
      const item = thresholds.find((t) => t.id === itemId);
      if (item) {
        setFormData({
          questionText: "",
          type: "radio",
          options: ["", ""],
          category: "symptom",
          isRequired: true,
          parameter: item.parameter,
          thresholdValue: item.thresholdValue.toString(),
          action: item.action,
        });
        setEditingItemId(itemId);
        handleTabSwitch("thresholds");
      }
    }
  };

  const handleDelete = (itemId, type) => {
    setItemToDelete({ id: itemId, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?.type === "questions") {
      setSettings((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      if (editingItemId === itemToDelete.id) {
        setEditingItemId(null);
        setFormData({
          questionText: "",
          type: "radio",
          options: ["", ""],
          category: "symptom",
          isRequired: true,
          parameter: "Risk Score",
          thresholdValue: "",
          action: "",
        });
      }
    } else if (itemToDelete?.type === "thresholds") {
      setThresholds((prev) => prev.filter((t) => t.id !== itemToDelete.id));
      if (editingItemId === itemToDelete.id) {
        setEditingItemId(null);
        setFormData({
          questionText: "",
          type: "radio",
          options: ["", ""],
          category: "symptom",
          isRequired: true,
          parameter: "Risk Score",
          thresholdValue: "",
          action: "",
        });
      }
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
    alert(`${itemToDelete?.type === "questions" ? "Question" : "Threshold"} deleted successfully!`);
  };

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Customization</title>
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
                      <Link className="nav-link active" to="/customization">
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
                <Link to="/admin">Home</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/manage-users">Manage Users</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/content-management">Resource Portal</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/database">Data Management</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/customization">Screening</Link>
              </div>
              <div onClick={closeMenu}>
                <Link to="/monitoring">Track</Link>
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
                  Screening Customization
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/admin">Admin Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Screening Customization
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
            <div className="col-lg-3">
              <div className="our-appointment-content">
                <div className="section-title">
                  <h3 data-aos="fade-up">customization</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                    Manage Screening
                  </h2>
                </div>
                <div className="appointment-content-body">
                  <div className="appointment-item" data-aos="fade-up" data-aos-delay="200">
                    <div className="appointment-item-content">
                      <button
                        className={`btn-default tab-button ${activeTab === "questions" ? "active" : ""}`}
                        onClick={() => handleTabSwitch("questions")}
                      >
                        Screening Questions
                      </button>
                    </div>
                  </div>
                  <div className="appointment-item" data-aos="fade-up" data-aos-delay="400">
                    <div className="appointment-item-content">
                      <button
                        className={`btn-default tab-button ${activeTab === "thresholds" ? "active" : ""}`}
                        onClick={() => handleTabSwitch("thresholds")}
                      >
                        Risk Thresholds
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              <div className="appointment-form">
                <div className={`tab-content ${activeTab === "questions" ? "active" : ""}`} id="questions">
                  <div className="section-title">
                    <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                      Screening Questions
                    </h2>
                  </div>
                  <form id="questionForm" onSubmit={handleSubmit} data-aos="fade-up">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="row">
                      <div className="form-group col-md-12 mb-4">
                        <input
                          type="text"
                          id="questionText"
                          name="questionText"
                          className="form-control"
                          placeholder="Question Text"
                          value={formData.questionText}
                          onChange={handleChange}
                          required
                        />
                        <div className="help-block with-errors"></div>
                      </div>
                      <div className="form-group col-md-6 mb-4">
                        <select
                          id="type"
                          name="type"
                          className="form-control form-select"
                          value={formData.type}
                          onChange={handleChange}
                          required
                        >
                          <option value="radio">Radio (Yes/No)</option>
                          <option value="select">Dropdown</option>
                          <option value="text">Text Input</option>
                        </select>
                        <div className="help-block with-errors"></div>
                      </div>
                      <div className="form-group col-md-6 mb-4">
                        <select
                          id="category"
                          name="category"
                          className="form-control form-select"
                          value={formData.category}
                          onChange={handleChange}
                          required
                        >
                          <option value="symptom">Symptom</option>
                          <option value="history">Medical History</option>
                          <option value="lifestyle">Lifestyle</option>
                        </select>
                        <div className="help-block with-errors"></div>
                      </div>
                      {formData.type !== "text" && (
                        <div className="form-group col-md-12 mb-4">
                          <label>Options</label>
                          {formData.options.map((option, index) => (
                            <div key={index} className="d-flex mb-2">
                              <input
                                type="text"
                                className="form-control me-2"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                              />
                              {formData.options.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => removeOption(index)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" className="btn btn-secondary" onClick={addOption}>
                            Add Option
                          </button>
                        </div>
                      )}
                      <div className="form-group col-md-6 mb-4">
                        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input
                            type="checkbox"
                            id="isRequired"
                            name="isRequired"
                            checked={formData.isRequired}
                            onChange={handleChange}
                          />
                          Required Question
                        </label>
                      </div>
                      <div className="col-lg-12">
                        <div className="contact-form-btn">
                          <button type="submit" className="btn-default">
                            Save Question
                          </button>
                          <button
                            type="button"
                            className="btn-default"
                            onClick={() => {
                              setFormData({
                                questionText: "",
                                type: "radio",
                                options: ["", ""],
                                category: "symptom",
                                isRequired: true,
                                parameter: "Risk Score",
                                thresholdValue: "",
                                action: "",
                              });
                              setEditingItemId(null);
                              setError("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                  <div className="mt-4">
                    <h3 data-aos="fade-up">Existing Questions</h3>
                    {settings.length === 0 ? (
                      <p data-aos="fade-up" data-aos-delay="200">
                        No questions added yet.
                      </p>
                    ) : (
                      settings.map((item, index) => (
                        <div
                          key={item.id}
                          className="appointment-item"
                          data-aos="fade-up"
                          data-aos-delay={`${(index + 2) * 200}`}
                        >
                          <div className="appointment-item-content">
                            <h3>
                              {item.questionText}{" "}
                              <span
                                style={{
                                  backgroundColor:
                                    item.category === "symptom"
                                      ? 'var(--primary-color)'
                                      : item.category === "history"
                                      ? 'var(--accent-color)'
                                      : 'var(--divider-color)',
                                  color: 'var(--white-color)',
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                }}
                              >
                                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                              </span>
                            </h3>
                            <p>
                              Type: {item.type.charAt(0).toUpperCase() + item.type.slice(1)} ·{" "}
                              {item.options.length > 0 && `Options: ${item.options.join(", ")} · `}
                              {item.isRequired ? "Required" : "Optional"} · Updated: {item.dateUpdated}
                            </p>
                            <button
                              className="btn-default btn-edit"
                              onClick={() => handleEdit(item.id, "questions")}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-default btn-delete"
                              style={{ backgroundColor: 'var(--error-color)' }}
                              onClick={() => handleDelete(item.id, "questions")}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className={`tab-content ${activeTab === "thresholds" ? "active" : ""}`} id="thresholds">
                  <div className="section-title">
                    <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                      Risk Thresholds
                    </h2>
                  </div>
                  <form id="thresholdForm" onSubmit={handleSubmit} data-aos="fade-up">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="row">
                      <div className="form-group col-md-6 mb-4">
                        <input
                          type="text"
                          id="parameter"
                          name="parameter"
                          className="form-control"
                          placeholder="Parameter (e.g., Risk Score)"
                          value={formData.parameter}
                          onChange={handleChange}
                          disabled
                        />
                        <div className="help-block with-errors"></div>
                      </div>
                      <div className="form-group col-md-6 mb-4">
                        <input
                          type="number"
                          id="thresholdValue"
                          name="thresholdValue"
                          className="form-control"
                          placeholder="Threshold Value (0-1)"
                          value={formData.thresholdValue}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          max="1"
                          required
                        />
                        <div className="help-block with-errors"></div>
                      </div>
                      <div className="form-group col-md-12 mb-4">
                        <input
                          type="text"
                          id="action"
                          name="action"
                          className="form-control"
                          placeholder="Action (e.g., Recommend consultation)"
                          value={formData.action}
                          onChange={handleChange}
                        />
                        <div className="help-block with-errors"></div>
                      </div>
                      <div className="col-lg-12">
                        <div className="contact-form-btn">
                          <button type="submit" className="btn-default">
                            Save Threshold
                          </button>
                          <button
                            type="button"
                            className="btn-default"
                            onClick={() => {
                              setFormData({
                                questionText: "",
                                type: "radio",
                                options: ["", ""],
                                category: "symptom",
                                isRequired: true,
                                parameter: "Risk Score",
                                thresholdValue: "",
                                action: "",
                              });
                              setEditingItemId(null);
                              setError("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                  <div className="mt-4">
                    <h3 data-aos="fade-up">Existing Thresholds</h3>
                    {thresholds.length === 0 ? (
                      <p data-aos="fade-up" data-aos-delay="200">
                        No thresholds added yet.
                      </p>
                    ) : (
                      thresholds.map((item, index) => (
                        <div
                          key={item.id}
                          className="appointment-item"
                          data-aos="fade-up"
                          data-aos-delay={`${(index + 2) * 200}`}
                        >
                          <div className="appointment-item-content">
                            <h3>{item.parameter}</h3>
                            <p>
                              Threshold: {item.thresholdValue} · Action: {item.action} · Updated: {item.dateUpdated}
                            </p>
                            <button
                              className="btn-default btn-edit"
                              onClick={() => handleEdit(item.id, "thresholds")}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-default btn-delete"
                              style={{ backgroundColor: 'var(--error-color)' }}
                              onClick={() => handleDelete(item.id, "thresholds")}
                            >
                              Delete
                            </button>
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
      </div>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this {itemToDelete?.type === "questions" ? "question" : "threshold"}? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container">
        <Link to="/admin" className="btn-default" style={{ margin: "20px 0", display: "inline-block" }}>
          Back to Dashboard
        </Link>
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