import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { authService } from "../../services/authService";

function CreateDoctorAccount() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdDoctor, setCreatedDoctor] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCreatedDoctor(null);
    setSaving(true);

    try {
      const data = await authService.createDoctorAccount(form);
      setCreatedDoctor(data.user);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Doctor account creation failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader
        title="Create Doctor Account"
        subtitle="Step 1: Create doctor login account in auth-service."
      />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <label>
            Doctor Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Doctor Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className="span-2">
            Temporary Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Creating..." : "Create Doctor Account"}
        </button>
      </form>

      {createdDoctor && (
        <div className="panel success-panel">
          <h3>Doctor account created</h3>
          <p>
            <strong>User ID:</strong> {createdDoctor.id}
          </p>
          <p>
            Use this user ID in the "Create Doctor Profile" page to link profile and auth account.
          </p>
        </div>
      )}
    </section>
  );
}

export default CreateDoctorAccount;
