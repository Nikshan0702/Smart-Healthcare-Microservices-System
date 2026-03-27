import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roleHomePath, useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

function RegisterPatient() {
  const navigate = useNavigate();
  const { applyAuthData } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.registerPatient({
        name: form.name,
        email: form.email,
        password: form.password
      });

      applyAuthData(data);
      navigate(roleHomePath(data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Patient registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container centered-page">
      <div className="form-card auth-card">
        <h1>Patient Registration</h1>
        <p>Create a patient account to access doctor listings and appointments.</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Registering..." : "Register as Patient"}
          </button>
        </form>

        <p className="auth-helper">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPatient;
