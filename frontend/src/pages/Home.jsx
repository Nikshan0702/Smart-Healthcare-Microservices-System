import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero__layout landing-hero__layout--single">
            <div className="landing-hero__copy">
              <span className="eyebrow">Healthcare Portal</span>
              <h1>Book Doctors Online With Confidence</h1>
              <p>
                A professional healthcare platform for booking appointments,
                managing medical reports, and viewing prescriptions.
              </p>

              <div className="landing-hero__actions">
                <Link className="btn btn-primary btn-large" to="/doctors">
                  Find Doctors
                </Link>
                <Link className="btn btn-outline btn-large" to="/register-patient">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-header text-center">
            <span className="eyebrow">Services</span>
            <h2>Everything You Need in One Place</h2>
            <p>Simple, fast, and reliable healthcare management.</p>
          </div>

          <div className="landing-feature-grid">
            <article className="landing-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Trusted Doctors</h3>
              <p>Find specialists and review their profile details before booking.</p>
            </article>

            <article className="landing-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Quick Appointments</h3>
              <p>Choose a date and time that fits your schedule and confirm easily.</p>
            </article>

            <article className="landing-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/>
                  <line x1="8" y1="17" x2="12" y2="17"/>
                </svg>
              </div>
              <h3>Medical Reports</h3>
              <p>Upload and access important health documents whenever needed.</p>
            </article>

            <article className="landing-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Easy Payments</h3>
              <p>Complete consultation payments and track payment status.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="landing-cta">
            <div>
              <h2>Need a Consultation?</h2>
              <p>
                Create your account and start booking specialist appointments online.
              </p>
            </div>
            <div className="landing-cta__actions">
              <Link className="btn btn-primary btn-large" to="/register-patient">
                Sign Up
              </Link>
              <Link className="btn btn-outline btn-large" to="/login">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
