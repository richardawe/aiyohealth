import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Preloader } from './components/Preloader';
import AuthProvider from './components/AuthProvider';
import { slide as Menu } from 'react-burger-menu';
import './assets/css/auth.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { useAuth } = AuthProvider;

export const Database = () => {
  const { user, token, logout, isLoading, apiBaseUrl } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    riskCategories: { low: 0, medium: 0, high: 0 },
    screeningStats: { yes: 0, no: 0 },
    ageGroups: {
      'Under 20': 0,
      '20-30': 0,
      '31-40': 0,
      '41-50': 0,
      'Over 50': 0
    }
  });

  const riskChartRef = useRef();
  const screeningChartRef = useRef();
  const ageChartRef = useRef();

  useEffect(() => {
    AOS.init();
    if (isLoading) return;
    if (!user) {
      console.log('Not authenticated, redirecting to /login');
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      console.log('Access denied, not an admin');
      navigate('/'); // Use root or a safe default route
      return;
    }
    fetchAnalytics();
  }, [user, isLoading, navigate, dateRange, logout]);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch users and history data
      const [usersResponse, historyResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        }),
        fetch(`${apiBaseUrl}/admin/symptom-history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        })
      ]); 

      // Check content type and status for both responses
      for (const response of [usersResponse, historyResponse]) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          await logout();
          navigate('/login');
          return;
        }

        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      }

      const [usersData, historyData] = await Promise.all([
        usersResponse.json(),
        historyResponse.json()
      ]);

      if (!usersData.success || !historyData.success) {
        throw new Error(usersData.message || historyData.message || 'Failed to fetch data');
      }

      // Process data for analytics
      const now = new Date();
      const filterDate = new Date();
      switch(dateRange) {
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(filterDate.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }

      const filteredHistory = historyData.history.filter(h => 
        new Date(h.logged_at) >= filterDate
      );

      const analytics = {
        totalUsers: usersData.users.length,
        riskCategories: {
          low: filteredHistory.filter(h => h.risk_category === 'Low risk').length,
          medium: filteredHistory.filter(h => h.risk_category === 'Medium risk').length,
          high: filteredHistory.filter(h => h.risk_category === 'High risk').length
        },
        screeningStats: {
          yes: usersData.users.filter(u => u.has_screening === 'yes').length,
          no: usersData.users.filter(u => u.has_screening === 'no').length
        },
        ageGroups: {
          'Under 20': 0,
          '20-30': 0,
          '31-40': 0,
          '41-50': 0,
          'Over 50': 0
        }
      };

      // Process age groups from history
      filteredHistory.forEach(h => {
        const age = h.age;
        if (age < 20) analytics.ageGroups['Under 20']++;
        else if (age <= 30) analytics.ageGroups['20-30']++;
        else if (age <= 40) analytics.ageGroups['31-40']++;
        else if (age <= 50) analytics.ageGroups['41-50']++;
        else analytics.ageGroups['Over 50']++;
      });

      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleExport = async () => {
    try {
      // Fetch CSRF token first
      const csrfRes = await fetch(`${apiBaseUrl}/get-csrf-token`, {
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrf_token;

      // Get chart images as base64
      const riskChartImg = riskChartRef.current?.toBase64Image?.() || '';
      const screeningChartImg = screeningChartRef.current?.toBase64Image?.() || '';
      const ageChartImg = ageChartRef.current?.toBase64Image?.() || '';

      const exportPayload = {
        reportType: 'analytics',
        dateRange,
        data: analyticsData,
        charts: {
          risk: riskChartImg,
          screening: screeningChartImg,
          age: ageChartImg
        }
      };

      const response = await fetch(`${apiBaseUrl}/admin/generate-analytics-pdf`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(exportPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Error generating report. Please try again.');
    }
  };

  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [
        analyticsData.riskCategories.low,
        analyticsData.riskCategories.medium,
        analyticsData.riskCategories.high
      ],
      backgroundColor: ['#4CAF50', '#FFA726', '#EF5350'],
      borderWidth: 1
    }]
  };

  const screeningStatsData = {
    labels: ['Has Screening', 'No Screening'],
    datasets: [{
      data: [analyticsData.screeningStats.yes, analyticsData.screeningStats.no],
      backgroundColor: ['#2196F3', '#9E9E9E'],
      borderWidth: 1
    }]
  };

  const ageDistributionData = {
    labels: Object.keys(analyticsData.ageGroups),
    datasets: [{
      label: 'Users by Age Group',
      data: Object.values(analyticsData.ageGroups),
      backgroundColor: '#3F51B5',
      borderColor: '#1A237E',
      borderWidth: 1
    }]
  };

  return (
    <>
      <Helmet>
        <title>Aiyo Care - Database Analytics</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
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

      <div className="page-header bg-section dark-section" data-aos="fade-up">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-3" data-cursor="-opaque">Database Analytics</h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">home</Link></li>
                    <li className="breadcrumb-item"><Link to="/admin">Admin Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Database Analytics</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-book-appointment">
        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row mb-4">
            <div className="col-lg-6">
              <div className="form-group">
                <label>Date Range</label>
                <select
                  className="form-select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center">Loading analytics...</div>
          ) : (
            <>
              <div className="row mb-4">
                <div className="col-lg-3">
                  <div className="stat-card bg-section">
                    <h3>Total Users</h3>
                    <h2>{analyticsData.totalUsers}</h2>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="chart-container bg-section p-4">
                    <h3>Risk Distribution</h3>
                    <div style={{ height: '300px' }}>
                      <Pie ref={riskChartRef} data={riskDistributionData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-lg-6">
                  <div className="chart-container bg-section p-4">
                    <h3>Screening Statistics</h3>
                    <div style={{ height: '300px' }}>
                      <Pie ref={screeningChartRef} data={screeningStatsData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="chart-container bg-section p-4">
                    <h3>Age Distribution</h3>
                    <div style={{ height: '300px' }}>
                      <Bar 
                        ref={ageChartRef} 
                        data={ageDistributionData} 
                        options={{ 
                          maintainAspectRatio: false,
                          scales: {
                            y: { beginAtZero: true }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <button className="btn-default" onClick={handleExport}>
                  Generate Report
                </button>
              </div>
            </>
          )}
        </div>
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

export default Database;