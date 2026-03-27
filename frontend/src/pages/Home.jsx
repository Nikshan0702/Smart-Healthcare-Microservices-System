import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Smart Healthcare</span>
            <h1>Clear. Minimal. Ready for care workflows.</h1>
            <p>One platform for patients, doctors, and admin teams.</p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/doctors">
                Find Doctors
              </Link>
              <Link className="btn btn-outline" to="/register-patient">
                Register
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h3>Quick Flow</h3>
            <p>Search doctor. Check profile. Continue to consultation.</p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-header">
            <h2>Core Modules</h2>
            <p>Built for speed and clarity.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon">01</span>
              <h3>Patient</h3>
              <p>Register and discover doctors fast.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">02</span>
              <h3>Doctor</h3>
              <p>Maintain profile and availability.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">03</span>
              <h3>Admin</h3>
              <p>Create and manage doctor accounts.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
