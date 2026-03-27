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
          <span className="brand-mark">SH</span>
          <span>Smart Healthcare</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div id="public-navigation" className={`nav-panel${menuOpen ? " open" : ""}`}>
          <nav className="nav-links">
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/doctors" onClick={closeMenu}>
              Doctors
            </NavLink>
            {!isAuthenticated && (
              <NavLink to="/register-patient" onClick={closeMenu}>
                Register
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="role-pill">{user?.role?.toLowerCase() || "user"}</span>
                <Link className="btn btn-outline" to={roleHomePath(user?.role)} onClick={closeMenu}>
                  Dashboard
                </Link>
                <button type="button" className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className="btn btn-primary" to="/login" onClick={closeMenu}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
