import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Preloader } from "./components/Preloader";
import AuthProvider from "./components/AuthProvider";
import { slide as Menu } from "react-burger-menu";
import "./assets/css/bootstrap.min.css";
import "./assets/css/slicknav.min.css";
import "./assets/css/swiper-bundle.min.css";
import "./assets/css/all.min.css";
import "./assets/css/animate.css";
import "./assets/css/magnific-popup.css";
import "./assets/css/mousecursor.css";
import "./assets/css/custom.css";
import "./assets/css/auth.css";

const { useAuth } = AuthProvider;

export const ContentManagement = () => {
  const { user, apiBaseUrl, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const editModalRef = useRef();

  useEffect(() => {
    AOS.init();
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/resources`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setResources(data.resources);
    } catch (e) {
      setUploadError("Failed to fetch resources.");
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    if (!form.title || !form.file) {
      setUploadError("Title and PDF file are required.");
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("file", form.file);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/resources`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess("Resource uploaded successfully!");
        setForm({ title: "", description: "", file: null });
        fetchResources();
      } else {
        setUploadError(data.message || "Upload failed.");
      }
    } catch (e) {
      setUploadError("Upload failed.");
    }
    setUploading(false);
  };

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/resources/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setResources(resources.filter((r) => r.id !== id));
      } else {
        alert(data.message || "Delete failed.");
      }
    } catch (e) {
      alert("Delete failed.");
    }
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setEditForm({ title: resource.title, description: resource.description });
    setEditError("");
    setEditSuccess("");
    setTimeout(() => {
      if (editModalRef.current) editModalRef.current.style.display = "block";
    }, 0);
  };

  const closeEditModal = () => {
    setEditingResource(null);
    setEditForm({ title: "", description: "" });
    setEditError("");
    setEditSuccess("");
    if (editModalRef.current) editModalRef.current.style.display = "none";
  };

  const handleEditInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    if (!editForm.title) {
      setEditError("Title is required.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      const res = await fetch(`${apiBaseUrl}/admin/resources/${editingResource.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setEditSuccess("Resource updated.");
        setResources(resources.map((r) => (r.id === editingResource.id ? data.resource : r)));
        setTimeout(closeEditModal, 800);
      } else {
        setEditError(data.message || "Edit failed.");
      }
    } catch (e) {
      setEditError("Edit failed.");
    }
  };

  return (
    <>
      <Helmet>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <title>Aiyo Care - Content Management</title>
        <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
                  <ul className="navbar-nav mr-auto" id="menu">
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
              <div className="navbar-toggle"></div>
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
      <div className="page-header bg-section dark-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-3" data-cursor="-opaque">
                  Content Management
                </h1>
                <nav className="wow fadeInUp">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/admin">Admin Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Content Management
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
              <div className="appointment-form">
                <div className="section-title">
                  <h3 className="wow fadeInUp">add resource</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">
                    Upload Educational Content
                  </h2>
                </div>
                <form id="contentForm" data-toggle="validator" className="wow fadeInUp" onSubmit={handleUpload}>
                  <div className="row">
                    <div className="form-group col-md-12 mb-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Resource Title"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        required
                      />
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group col-md-12 mb-4">
                      <textarea
                        className="form-control"
                        placeholder="Description"
                        rows="4"
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                      ></textarea>
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group col-md-12 mb-4">
                      <label>Upload PDF</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                      />
                      <div className="help-block with-errors"></div>
                    </div>
                    {uploadError && <div className="alert alert-danger">{uploadError}</div>}
                    {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}
                    <div className="col-lg-12">
                      <div className="contact-form-btn">
                        <button type="submit" className="btn-default" disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload Resource"}
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
                  <h3 className="wow fadeInUp">existing resources</h3>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">
                    Current Content
                  </h2>
                </div>
                <div className="appointment-content-body">
                  {resources.map((res, index) => (
                    <div
                      key={res.id}
                      className="appointment-item wow fadeInUp"
                      data-wow-delay={`${0.2 * (index + 1)}s`}
                    >
                      <div className="appointment-item-content">
                        <h3>{res.title}</h3>
                        <p>{res.description}</p>
                        <a
                          href={`${apiBaseUrl}/resources/${res.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-default"
                        >
                          View
                        </a>
                        <button
                          className="btn-default"
                          style={{ backgroundColor: 'var(--error-color)', marginLeft: "8px" }}
                          onClick={() => handleDelete(res.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn-default"
                          style={{ backgroundColor: 'var(--text-color)', marginLeft: "8px" }}
                          onClick={() => openEditModal(res)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={editModalRef}
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          zIndex: 9999,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 8,
            maxWidth: 400,
            margin: "10vh auto",
            position: "relative",
          }}
        >
          <button
            onClick={closeEditModal}
            style={{ position: "absolute", top: 8, right: 8, border: "none", background: "none", fontSize: 20 }}
          >
            ×
          </button>
          <h4>Edit Resource</h4>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={editForm.title}
                onChange={handleEditInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={editForm.description}
                onChange={handleEditInputChange}
              />
            </div>
            {editError && <div className="alert alert-danger">{editError}</div>}
            {editSuccess && <div className="alert alert-success">{editSuccess}</div>}
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>
        </div>
      </div>
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