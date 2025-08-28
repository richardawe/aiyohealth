import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="main-header">
      <div className="header-sticky bg-section">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
            <img src="/images/logo.png" alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px', width: 'auto', height: '50px', objectFit: 'contain' }} />
            </Link>
            <div className="collapse navbar-collapse main-menu">
              <div className="nav-menu-wrapper">
                <ul className="navbar-nav mr-auto" id="menu">
                  <li className="nav-item submenu">
                    <Link className="nav-link" to="/">Home</Link>
                    <ul>
                      <li className="nav-item"><Link className="nav-link" to="/">Home - Main</Link></li>
                    </ul>
                  </li>
                  
                  <li className="nav-item"><Link className="nav-link" to="/contact">Contact Us</Link></li>
                  <li className="nav-item highlighted-menu"><Link className="nav-link" to="/login">Portal</Link></li>
                </ul>
              </div>
              <div className="header-contact-btn">
                <a href="tel:123456789" className="header-contact-now">
                  <i className="fa-solid fa-phone"></i>(+22) 123 456 789
                </a>
                <Link to="/login" className="btn-default">Portal</Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="responsive-menu">
          <Menu right isOpen={menuOpen} onStateChange={handleStateChange}>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/health-resources" onClick={closeMenu}>Health Resources</Link>
            <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
            <Link to="/login" onClick={closeMenu}>Portal</Link>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;