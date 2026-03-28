import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <section className="site-footer__about">
          <h3>MediCare</h3>
          <p>
            Professional healthcare platform for online appointment booking,
            digital prescriptions, and report management.
          </p>
        </section>

        <section className="site-footer__links">
          <h4>Platform</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/doctors">Doctors</Link>
            </li>
          </ul>
        </section>

        <section className="site-footer__links">
          <h4>Account</h4>
          <ul>
            <li>
              <Link to="/login">Sign In</Link>
            </li>
            <li>
              <Link to="/register-patient">Sign Up</Link>
            </li>
            <li>
              <Link to="/doctors">Book Appointment</Link>
            </li>
          </ul>
        </section>

        <section className="site-footer__contact">
          <h4>Support</h4>
          <ul>
            <li>
              <strong>Email:</strong> support@medicare.local
            </li>
            <li>
              <strong>Phone:</strong> +94 11 000 0000
            </li>
            <li>
              <strong>Hours:</strong> 24/7
            </li>
          </ul>
        </section>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p>&copy; {year} MediCare. All rights reserved.</p>
          <p className="site-footer__bottom-note">Built for reliable and user-friendly healthcare access.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
