import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Smart Healthcare</h3>
          <p>Minimal healthcare interface.</p>
        </div>

        <div className="footer-links">
          <h4>Navigate</h4>
          <ul className="footer-link-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/doctors">Doctors</Link>
            </li>
            <li>
              <Link to="/register-patient">Register</Link>
            </li>
          </ul>
        </div>

        <div className="footer-meta">
          <h4>Info</h4>
          <ul className="footer-meta-list">
            <li>University Project</li>
            <li>{year}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
