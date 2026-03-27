import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";

const initialForm = {
  userId: "",
  name: "",
  email: "",
  specialization: "",
  experience: 0,
  hospital: "",
  consultationFee: 0,
  availabilityText: "Monday: 09:00, 10:00"
};

const parseAvailabilityText = (text) => {
  if (!text.trim()) return [];

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [dayPart, slotsPart = ""] = line.split(":");
      return {
        day: (dayPart || "").trim(),
        slots: slotsPart
          .split(",")
          .map((slot) => slot.trim())
          .filter(Boolean)
      };
    })
    .filter((item) => item.day);
};

function CreateDoctorProfile() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        userId: form.userId,
        name: form.name,
        email: form.email,
        specialization: form.specialization,
        experience: Number(form.experience),
        hospital: form.hospital,
        consultationFee: Number(form.consultationFee),
        availability: parseAvailabilityText(form.availabilityText)
      };

      const data = await doctorService.createDoctorProfile(payload);
      setSuccess(data.message || "Doctor profile created successfully.");
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Doctor profile creation failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader
        title="Create Doctor Profile"
        subtitle="Step 2: Create doctor profile in doctor-service and link to userId."
      />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <label>
            Linked User ID
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

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
              min="0"
              name="experience"
              value={form.experience}
              onChange={handleChange}
            />
          </label>

          <label>
            Consultation Fee (LKR)
            <input
              type="number"
              min="0"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
            />
          </label>

          <label className="span-2">
            Hospital
            <input type="text" name="hospital" value={form.hospital} onChange={handleChange} />
          </label>

          <label className="span-2">
            Availability (one line per day, format: Day: slot1, slot2)
            <textarea
              name="availabilityText"
              value={form.availabilityText}
              onChange={handleChange}
              rows="5"
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Creating..." : "Create Doctor Profile"}
        </button>
      </form>
    </section>
  );
}

export default CreateDoctorProfile;
