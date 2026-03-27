import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { patientService } from "../../services/patientService";

const initialForm = {
  name: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  medicalHistory: ""
};

function PatientProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await patientService.getMyProfile();
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          address: data.address || "",
          medicalHistory: data.medicalHistory || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await patientService.updateMyProfile(form);
      setSuccess(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader title="My Profile" subtitle="Update your personal and medical history details." />

      {loading && <p>Loading profile...</p>}

      {!loading && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <label>
              Full Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Phone
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </label>

            <label>
              Date of Birth
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
            </label>

            <label>
              Gender
              <input type="text" name="gender" value={form.gender} onChange={handleChange} />
            </label>

            <label className="span-2">
              Address
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </label>

            <label className="span-2">
              Medical History
              <textarea
                name="medicalHistory"
                value={form.medicalHistory}
                onChange={handleChange}
                rows="5"
                placeholder="Allergies, chronic conditions, and previous treatments"
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </section>
  );
}

export default PatientProfile;
