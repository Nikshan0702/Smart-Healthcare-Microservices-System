import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { appointmentService } from "../../services/appointmentService";
import { doctorService } from "../../services/doctorService";

function BookAppointment() {
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctorId") || "";

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    doctorProfileId: preselectedDoctorId,
    appointmentDate: "",
    timeSlot: "09:00 AM",
    reason: ""
  });

  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const data = await doctorService.getDoctors();
        setDoctors(Array.isArray(data) ? data : []);
      } catch {
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
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
      const data = await appointmentService.bookAppointment(form);
      setSuccess(data.message || "Appointment booked successfully.");
      setForm((prev) => ({ ...prev, reason: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader
        title="Book Appointment"
        subtitle="Choose a doctor, date, and time slot to request an appointment."
      />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <label className="span-2">
            Doctor
            <select
              name="doctorProfileId"
              value={form.doctorProfileId}
              onChange={handleChange}
              required
              disabled={loadingDoctors}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </label>

          <label>
            Appointment Date
            <input
              type="date"
              name="appointmentDate"
              value={form.appointmentDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Time Slot
            <input type="text" name="timeSlot" value={form.timeSlot} onChange={handleChange} required />
          </label>

          <label className="span-2">
            Reason
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows="4"
              placeholder="Briefly describe your issue"
              required
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button className="btn btn-primary" type="submit" disabled={saving || loadingDoctors}>
          {saving ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </section>
  );
}

export default BookAppointment;
