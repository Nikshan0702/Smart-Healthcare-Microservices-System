import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { appointmentService } from "../../services/appointmentService";

const statusOptions = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"];

function DoctorAppointments() {
  const [status, setStatus] = useState("ALL");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await appointmentService.getDoctorAppointments(status === "ALL" ? {} : { status });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctor appointments.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [status]);

  const handleAccept = async (id) => {
    setError("");
    setSuccess("");
    try {
      await appointmentService.acceptAppointment(id);
      setSuccess("Appointment accepted.");
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept appointment.");
    }
  };

  const handleReject = async (id) => {
    const rejectionReason = window.prompt("Enter rejection reason:", "Doctor is unavailable for this slot");
    if (!rejectionReason) return;

    setError("");
    setSuccess("");
    try {
      await appointmentService.rejectAppointment(id, { rejectionReason });
      setSuccess("Appointment rejected.");
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject appointment.");
    }
  };

  const handleComplete = async (id) => {
    setError("");
    setSuccess("");
    try {
      await appointmentService.completeAppointment(id);
      setSuccess("Appointment marked as completed.");
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete appointment.");
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader title="Appointment Requests" subtitle="Accept/reject requests and complete consultations." />

      <div className="panel">
        <h3>Status Filter</h3>
        <div className="quick-actions">
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`btn ${status === option ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatus(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
      {loading && <p>Loading appointments...</p>}
      {!loading && appointments.length === 0 && <p>No appointments found.</p>}

      {!loading && appointments.length > 0 && (
        <div className="stats-grid">
          {appointments.map((appointment) => (
            <div className="stat-card" key={appointment._id}>
              <h3>{appointment.patientName}</h3>
              <p className="stat-value">{appointment.status}</p>
              <span>
                {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
              </span>
              <span>Reason: {appointment.reason}</span>
              <span>Patient Email: {appointment.patientEmail}</span>
              {appointment.rejectionReason && <span>Rejection: {appointment.rejectionReason}</span>}

              <div className="quick-actions">
                {appointment.status === "PENDING" && (
                  <>
                    <button className="btn btn-primary" type="button" onClick={() => handleAccept(appointment._id)}>
                      Accept
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => handleReject(appointment._id)}>
                      Reject
                    </button>
                  </>
                )}

                {appointment.status === "ACCEPTED" && (
                  <>
                    <a className="btn btn-outline" href={appointment.meetingLink} target="_blank" rel="noreferrer">
                      Join Jitsi
                    </a>
                    <button className="btn btn-primary" type="button" onClick={() => handleComplete(appointment._id)}>
                      Mark Completed
                    </button>
                  </>
                )}

                {(appointment.status === "ACCEPTED" || appointment.status === "COMPLETED") && (
                  <Link
                    className="btn btn-outline"
                    to={`/doctor/issue-prescription?patientId=${appointment.patientId}&appointmentId=${appointment._id}`}
                  >
                    Issue Prescription
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default DoctorAppointments;
