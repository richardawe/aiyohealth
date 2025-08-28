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

export const UserManagement = () => {
  const { logout, apiBaseUrl } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');
  const [editingUserId, setEditingUserId] = useState(null);  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    state: '',
    city: '',
    contact_number: '',
    occupation: '',
    has_cancer: 'no',
    is_aware: 'no',
    has_screening: 'no',
    role: 'user',
    isActive: true
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setError('Error fetching users.');
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
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setEditingUserId(null);
    setFormData({
      firstName: '',
      lastName: '',      username: '',
      email: '',
      current_password: '',
      new_password: '',
      role: 'user',
      isActive: true,
      state: '',
      city: '',
      contact_number: '',
      occupation: '',
      has_cancer: 'no',
      is_aware: 'no',
      has_screening: 'no'
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');    const {
      email,
      role,
      isActive,
      username,
      state,
      city,
      contact_number,
      occupation,
      has_cancer,
      is_aware,
      has_screening
    } = formData;

    // When editing, only validate the fields that were changed
    if (!editingUserId) {
      // For new users, validate required fields
      if (!email || !username) {
        setError('Please complete all required fields.');
        return;
      }

      // Validate email format
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }// Password validation
    if (!editingUserId && !formData.new_password) {
      // Require password for new users
      setError('Password is required for new users.');
      return;
    }

    // Validate password if it's being changed or it's a new user
    if (formData.new_password) {
      if (formData.new_password.length < 8) {
        setError('New password must be at least 8 characters');
        return;
      }
      if (editingUserId && !formData.current_password) {
        setError('Current password is required to change password');
        return;
      }
    }try {
      setLoading(true);
      let response, data;      // Prepare the user data      // Only include fields that have values
      const userData = {
        email,
        username,
        role: role || 'user',
        is_active: isActive,
        ...(state && { state }),
        ...(city && { city }),
        ...(contact_number && { contact_number }),
        ...(occupation && { occupation }),
        ...(has_cancer && { has_cancer }),
        ...(is_aware && { is_aware }),
        ...(has_screening && { has_screening })
      };

      // Only include password fields if a new password is provided
      if (!editingUserId || formData.new_password) {
        if (editingUserId) {
          userData.current_password = formData.current_password;
          userData.new_password = formData.new_password;
        } else {
          userData.new_password = formData.new_password;
        }
      }

      if (editingUserId) {
        response = await fetch(`${apiBaseUrl}/admin/users/${editingUserId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        data = await response.json();
        if (data.success) {
          await fetchUsers();
          setEditingUserId(null);
          handleTabSwitch('directory');
          alert('User updated successfully!');
        } else {
          setError(data.message || 'Failed to update user.');
        }
      } else {        response = await fetch(`${apiBaseUrl}/admin/users`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        data = await response.json();
        if (data.success) {
          await fetchUsers();
          handleTabSwitch('directory');
          alert('User created successfully!');
        } else {
          setError(data.message || 'Failed to create user.');
        }
      }      // Reset the form, clearing password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
      }));
    } catch (err) {
      setError('Error saving user.');
    } finally {
      setLoading(false);
    }
  };  const handleEdit = async (userId) => {
    try {
      setLoading(true);
      const userToEdit = users.find(user => user.id === userId);
      
      if (!userToEdit) {
        setError('User not found.');
        return;
      }

      setFormData({
        firstName: userToEdit.first_name || userToEdit.firstName || '',
        lastName: userToEdit.last_name || userToEdit.lastName || '',
        email: userToEdit.email || '',
        role: userToEdit.role || 'user',
        isActive: userToEdit.is_active !== undefined ? userToEdit.is_active : userToEdit.isActive,
        username: userToEdit.username || '',
        state: userToEdit.state || '',
        city: userToEdit.city || '',
        contact_number: userToEdit.contact_number || '',
        occupation: userToEdit.occupation || '',
        has_cancer: userToEdit.has_cancer || 'no',
        is_aware: userToEdit.is_aware || 'no',
        has_screening: userToEdit.has_screening || 'no'
      });
      
      setEditingUserId(userId);
      setActiveTab('manage');
      setError('');
    } catch (err) {
      console.error('Error preparing user for edit:', err);
      setError('Error preparing user for edit.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/admin/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        const data = await response.json();
        if (data.success) {
          fetchUsers();
          alert('User deleted successfully!');
        } else {
          setError(data.message || 'Failed to delete user.');
        }
      } catch (err) {
        setError('Error deleting user.');
      } finally {
        setLoading(false);
      }
    }
  };


return (
    <>
      <Helmet>
        <title>Aiyo Care - User Management</title>
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
      
      {/* Header Navigation */}
      <header className="main-header">
        <div className="header-sticky bg-section">
          <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/admin">
                <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
              </Link>
              <div className="collapse navbar-collapse main-menu">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav ms-auto" id="menu">
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-users">Manage Users</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/content-management">Resource Portal</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/database">Data Management</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customization">Screening</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/monitoring">Track</Link>
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
          
          {/* Mobile Menu */}
          <div className="responsive-menu">
            <Menu right isOpen={menuOpen} onStateChange={handleStateChange}>
              <div onClick={closeMenu}><Link to="/admin">Home</Link></div>
              <div onClick={closeMenu}><Link to="/manage-users">Manage Users</Link></div>
              <div onClick={closeMenu}><Link to="/content-management">Resource Portal</Link></div>
              <div onClick={closeMenu}><Link to="/database">Data Management</Link></div>
              <div onClick={closeMenu}><Link to="/customization">Screening</Link></div>
              <div onClick={closeMenu}><Link to="/monitoring">Track</Link></div>
              <button className="btn-default" onClick={logout}>Log Out</button>
            </Menu>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="page-header bg-section dark-section" data-aos="fade-up">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-3" data-cursor="-opaque">User Management</h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/admin">Admin Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">User Management</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-book-appointment">
        <div className="container">
          
          {/* Tab Navigation */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="section-title text-center">
                <h3 data-aos="fade-up">User Management Dashboard</h3>
                <h2 className="text-anime-style-3" data-cursor="-opaque" data-aos="fade-up">
                  {activeTab === 'manage' ? 'Create/Edit User Account' : 'User Directory'}
                </h2>
              </div>
              
              {/* Tab Buttons */}
              <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                <button
                  className={`btn-default tab-button ${activeTab === 'manage' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('manage')}
                  style={{ marginRight: '15px' }}
                >
                  <i className="fa-solid fa-user-plus"></i> Create/Edit User
                </button>
                <button
                  className={`btn-default tab-button ${activeTab === 'directory' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('directory')}
                >
                  <i className="fa-solid fa-users"></i> View All Users ({users.length})
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="row">
            <div className="col-12">
              
              {/* Create/Edit User Tab */}
              <div className={`tab-content ${activeTab === 'manage' ? 'active' : ''}`} id="manage">
                <div className="appointment-form">
                  <div className="section-title">
                    <h3 data-aos="fade-up">
                      {editingUserId ? 'Edit User Account' : 'Create New User Account'}
                    </h3>
                  </div>
                  
                  <form id="userForm" onSubmit={handleSubmit} data-aos="fade-up">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="username">Username *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                            maxLength={50}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="email">Email Address *</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                            maxLength={120}
                          />
                        </div>
                      </div>
                      
                      {/* Password Fields */}
                      {editingUserId && (
                        <div className="col-md-6">
                          <div className="form-group mb-4">
                            <label htmlFor="current_password">Current Password</label>
                            <input
                              type="password"
                              className="form-control"
                              id="current_password"
                              name="current_password"
                              value={formData.current_password}
                              onChange={handleChange}
                              placeholder="Current Password (for password change)"
                            />
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="new_password">
                            {editingUserId ? 'New Password' : 'Password *'}
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            placeholder={editingUserId ? "Enter new password" : "Enter password"}
                            required={!editingUserId}
                            maxLength={128}
                          />
                          {editingUserId && (
                            <small className="form-text text-muted">
                              Leave blank to keep current password
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="state">State *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                            required
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="city">City *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                            required
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="contact_number">Contact Number *</label>
                          <input
                            type="tel"
                            className="form-control"
                            id="contact_number"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            placeholder="Enter contact number"
                            required
                            maxLength={20}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="occupation">Occupation *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            placeholder="Enter occupation"
                            required
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-group mb-4">
                          <label>History of Cancer *</label>
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
                              />
                              <label className="form-check-label" htmlFor="has_cancer_yes">Yes</label>
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
                              />
                              <label className="form-check-label" htmlFor="has_cancer_no">No</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-group mb-4">
                          <label>Aware of Cervical Cancer *</label>
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
                              />
                              <label className="form-check-label" htmlFor="is_aware_yes">Yes</label>
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
                              />
                              <label className="form-check-label" htmlFor="is_aware_no">No</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-group mb-4">
                          <label>Ever Been Screened *</label>
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
                              />
                              <label className="form-check-label" htmlFor="has_screening_yes">Yes</label>
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
                              />
                              <label className="form-check-label" htmlFor="has_screening_no">No</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label htmlFor="role">User Role *</label>
                          <select
                            className="form-control form-select"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Role</option>
                            <option value="user">Patient/User</option>
                            <option value="provider">Healthcare Provider</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              id="isActive"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleChange}
                            />
                            Account Active
                          </label>
                          <small className="text-muted">Uncheck to deactivate user account</small>
                        </div>
                      </div>

                    </div> {/* Close the row div */}
                    <div className="form-group text-center mt-4">
                      <button type="submit" className="btn-default">
                        {editingUserId ? 'Update User' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* User List Tab */}
              <div className={`tab-content ${activeTab === 'directory' ? 'active' : ''}`} id="directory">
                <div className="appointment-form">
                  <div className="section-title">
                    <h3 data-aos="fade-up">User Directory</h3>
                    <p>Manage all registered users in the system</p>
                  </div>
                  
                  <div id="userList">
                    {users.length === 0 ? (
                      <div className="appointment-item" data-aos="fade-up" data-aos-delay="200">
                        <div className="appointment-item-content text-center">
                          <i className="fa-solid fa-users" style={{ fontSize: '48px', opacity: '0.3', marginBottom: '20px' }}></i>
                          <h4>No Users Found</h4>
                          <p>No users have been created yet. Click "Create/Edit User" to add your first user.</p>
                          <button
                            className="btn-default"
                            onClick={() => handleTabSwitch('manage')}
                          >
                            <i className="fa-solid fa-user-plus"></i> Create First User
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Users List Header */}
                        <div className="users-header" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--secondary-color)', borderRadius: '8px' }}>
                          <div className="row">
                            <div className="col-md-8">
                              <h5>Total Users: {users.length}</h5>
                              <small className="text-muted">
                                Active: {users.filter(user => user.isActive).length} | 
                                Inactive: {users.filter(user => !user.isActive).length}
                              </small>
                            </div>
                            <div className="col-md-4 text-end">
                              <button
                                className="btn-default"
                                onClick={() => handleTabSwitch('manage')}
                              >
                                <i className="fa-solid fa-user-plus"></i> Add New User
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Users Cards */}
                        {users.map((user, index) => (
                          <div
                            key={user.id}
                            className="appointment-item"
                            data-aos="fade-up"
                            data-aos-delay={`${(index + 1) * 100}`}
                          >
                            <div className="appointment-item-content">
                              <div className="row align-items-center">
                                <div className="col-md-8">
                                  <div className="user-info">
                                    <h4 style={{ marginBottom: '8px' }}>
                                      {user.firstName} {user.lastName}
                                      <span
                                        style={{
                                          backgroundColor:
                                            user.role === 'admin'
                                              ? 'var(--primary-color)'
                                              : user.role === 'provider'
                                              ? 'var(--accent-color)'
                                              : 'var(--divider-color)',
                                          color: 'var(--white-color)',
                                          padding: '4px 10px',
                                          borderRadius: '12px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          marginLeft: '10px',
                                          textTransform: 'uppercase'
                                        }}
                                      >
                                        {user.role === 'admin'
                                          ? 'Admin'
                                          : user.role === 'provider'
                                          ? 'Provider'
                                          : 'Patient'}
                                      </span>
                                    </h4>
                                    <div className="user-details">
                                      <p style={{ marginBottom: '4px' }}>
                                        <i className="fa-solid fa-envelope"></i> {user.email}
                                      </p>
                                      <p style={{ marginBottom: '4px' }}>
                                        <i className="fa-solid fa-calendar"></i> Added: {user.dateAdded}
                                      </p>
                                      <p style={{ marginBottom: '0' }}>
                                        <i className={`fa-solid ${user.isActive ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                        <span style={{ color: user.isActive ? 'var(--accent-color)' : 'var(--error-color)' }}>
                                          {user.isActive ? 'Active Account' : 'Inactive Account'}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4 text-end">
                                  <div className="user-actions">
                                    <button
                                      className="btn-default btn-edit"
                                      onClick={() => handleEdit(user.id)}
                                      style={{ marginRight: '8px' }}
                                    >
                                      <i className="fa-solid fa-edit"></i> Edit
                                    </button>
                                    <button
                                      className="btn-default btn-delete"
                                      style={{ backgroundColor: 'var(--error-color)' }}
                                      onClick={() => handleDelete(user.id)}
                                    >
                                      <i className="fa-solid fa-trash"></i> Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Dashboard Link */}
          <div className="row">
            <div className="col-12 text-center" style={{ marginTop: '40px' }}>
              <Link to="/admin" className="btn-default">
                <i className="fa-solid fa-arrow-left"></i> Back to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
                    <li><a href="#"><i className="fa-brands fa-pinterest-p"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-x-twitter"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="footer-contact-box">
                <div className="footer-links footer-contact-item">
                  <h3>Contact:</h3>
                  <ul>
                    <li><i className="fa-solid fa-phone"></i><a href="tel:123456789">(+22) 123 456 789</a></li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>E-mail:</h3>
                  <ul>
                    <li><i className="fa-solid fa-envelope"></i><a href="mailto:domainname@gmail.com">domainname@gmail.com</a></li>
                  </ul>
                </div>
                <div className="footer-links footer-contact-item">
                  <h3>Address:</h3>
                  <ul>
                    <li><i className="fa-solid fa-location-dot"></i>123 High Street LN1 1AB Street UK</li>
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

export default UserManagement;

