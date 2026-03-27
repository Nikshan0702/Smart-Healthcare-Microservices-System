import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";

function DoctorProfile() {
  const [form, setForm] = useState({
    specialization: "",
    experience: 0,
    hospital: "",
    consultationFee: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await doctorService.getMyProfile();
        setProfileExists(true);
        setForm({
          specialization: data.specialization || "",
          experience: data.experience || 0,
          hospital: data.hospital || "",
          consultationFee: data.consultationFee || 0
        });
      } catch (err) {
        setProfileExists(false);
        setError(err.response?.data?.message || "Doctor profile was not found.");
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
      const payload = {
        specialization: form.specialization,
        experience: Number(form.experience),
        hospital: form.hospital,
        consultationFee: Number(form.consultationFee)
      };
      const data = await doctorService.updateMyProfile(payload);
      setSuccess(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader
        title="My Profile"
        subtitle="Keep your specialization, hospital, and consultation details updated."
      />

      {loading && <Loader label="Loading profile..." />}

      {!loading && !profileExists && (
        <EmptyState
          title="Profile not available"
          message={error || "Your doctor profile is not yet created by admin."}
        />
      )}

      {!loading && profileExists && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <label>
              Specialization
              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Experience (Years)
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Hospital
              <input type="text" name="hospital" value={form.hospital} onChange={handleChange} />
            </label>

            <label>
              Consultation Fee (LKR)
              <input
                type="number"
                name="consultationFee"
                value={form.consultationFee}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </section>
  );
}

export default DoctorProfile;
