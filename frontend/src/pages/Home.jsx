import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="hero-section healthcare-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="eyebrow">🏥 Quality Healthcare at Your Fingertips</span>
              <h1>Your Health, Our Priority</h1>
              <p className="hero-description">
                Connect with qualified doctors, book appointments instantly, and manage your healthcare journey all in one secure platform. Experience the future of medical care.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Qualified Doctors</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Happy Patients</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support Available</span>
                </div>
              </div>
              <div className="hero-actions">
                <Link className="btn btn-primary btn-large" to="/doctors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Find a Doctor
                </Link>
                <Link className="btn btn-outline btn-large" to="/register-patient">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Register Now
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card-container">
                <div className="hero-card primary">
                  <div className="card-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <h3>Easy Booking</h3>
                  <p>Book appointments in seconds with our intuitive scheduling system</p>
                </div>
                <div className="hero-card secondary">
                  <div className="card-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <h3>Expert Care</h3>
                  <p>Access specialized medical professionals across all major fields</p>
                </div>
                <div className="hero-card accent">
                  <div className="card-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3>Secure & Private</h3>
                  <p>Your health data is protected with enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-header text-center">
            <span className="eyebrow">Comprehensive Healthcare Services</span>
            <h2>Everything You Need for Better Health</h2>
            <p>From routine checkups to specialized consultations, we've got you covered</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Patient Care</h3>
              <p>Register, search doctors, book appointments, and manage your medical history in one place.</p>
              <Link to="/register-patient" className="feature-link">Get Started →</Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5Z"/>
                  <path d="M12 5L8 21l4-7 4 7-4-16Z"/>
                </svg>
              </div>
              <h3>Doctor Services</h3>
              <p>Manage your profile, set availability, consult patients, and grow your practice.</p>
              <Link to="/login" className="feature-link">Doctor Portal →</Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.78 7.78L3.54 3.54"/>
                </svg>
              </div>
              <h3>Admin Dashboard</h3>
              <p>Oversee operations, manage doctor accounts, and ensure quality healthcare delivery.</p>
              <Link to="/login" className="feature-link">Admin Access →</Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3>Digital Records</h3>
              <p>Access your complete medical history, test results, and prescriptions anytime, anywhere.</p>
              <Link to="/login" className="feature-link">View Records →</Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3>Easy Payments</h3>
              <p>Secure online payments for consultations with multiple payment options and instant receipts.</p>
              <Link to="/login" className="feature-link">Payment Options →</Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support to help you with appointments, payments, and more.</p>
              <Link to="/contact" className="feature-link">Contact Support →</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-section">
            <div className="cta-content">
              <h2>Ready to Take Control of Your Health?</h2>
              <p>Join thousands of satisfied patients who trust MediCare for their healthcare needs.</p>
              <div className="cta-actions">
                <Link className="btn btn-primary btn-large" to="/register-patient">
                  Start Your Journey
                </Link>
                <Link className="btn btn-outline btn-large" to="/doctors">
                  Browse Doctors
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="trust-badges">
                <div className="badge-item">
                  <span className="badge-icon">🔒</span>
                  <span className="badge-text">HIPAA Compliant</span>
                </div>
                <div className="badge-item">
                  <span className="badge-icon">✓</span>
                  <span className="badge-text">Verified Doctors</span>
                </div>
                <div className="badge-item">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-text">Award Winning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
