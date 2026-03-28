import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { roleHomePath, useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)"/>
              <path d="M16 8C13.79 8 12 9.79 12 12C12 13.1 12.45 14.1 13.17 14.83L14.59 13.41C14.21 13.03 14 12.55 14 12C14 10.9 14.9 10 16 10C17.1 10 18 10.9 18 12C18 12.55 17.79 13.03 17.41 13.41L18.83 14.83C19.55 14.1 20 13.1 20 12C20 9.79 18.21 8 16 8Z" fill="white"/>
              <path d="M16 4C11.58 4 8 7.58 8 12C8 16.42 11.58 20 16 20C20.42 20 24 16.42 24 12C24 7.58 20.42 4 16 4ZM16 18C12.69 18 10 15.31 10 12C10 8.69 12.69 6 16 6C19.31 6 22 8.69 22 12C22 15.31 19.31 18 16 18Z" fill="white"/>
              <rect x="14" y="20" width="4" height="8" fill="white"/>
              <rect x="12" y="26" width="8" height="2" fill="white"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">MediCare</span>
            <span className="brand-tagline">Smart Healthcare</span>
          </div>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div id="public-navigation" className={`nav-panel${menuOpen ? " open" : ""}`}>
          <nav className="nav-links">
            <NavLink to="/" end onClick={closeMenu} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Home
            </NavLink>
            <NavLink to="/doctors" onClick={closeMenu} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Find Doctors
            </NavLink>
            <NavLink to="/services" onClick={closeMenu} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Services
            </NavLink>
            {!isAuthenticated && (
              <NavLink to="/register-patient" onClick={closeMenu} className="nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Register
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="user-menu">
                  <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user?.name || 'User'}</span>
                    <span className="user-role">{user?.role?.toLowerCase() || 'patient'}</span>
                  </div>
                </div>
                <Link className="btn btn-outline" to={roleHomePath(user?.role)} onClick={closeMenu}>
                  Dashboard
                </Link>
                <button type="button" className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline" to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register-patient" onClick={closeMenu}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
