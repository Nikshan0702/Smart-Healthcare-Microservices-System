import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { appointmentService } from "../../services/appointmentService";

const statusOptions = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"];

const formatAppointmentDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

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

  const summary = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((appointment) => appointment.status === "PENDING").length,
      accepted: appointments.filter((appointment) => appointment.status === "ACCEPTED").length,
      completed: appointments.filter((appointment) => appointment.status === "COMPLETED").length
    }),
    [appointments]
  );

  return (
    <section className="dashboard-page doctor-page doctor-appointments-page">
      <PageHeader
        title="Doctor Appointments"
        subtitle="Review and action appointment requests quickly with clear status tracking."
        action={
          <Link className="btn btn-outline" to="/doctor/availability">
            Edit Availability
          </Link>
        }
      />

      <div className="stats-grid doctor-metric-grid doctor-appointments-metrics">
        <article className="stat-card stat-card--primary doctor-metric-card">
          <div className="stat-content">
            <h3>Total in View</h3>
            <p className="stat-value">{summary.total}</p>
            <p className="stat-description">Appointments returned for the selected filter.</p>
          </div>
        </article>

        <article className="stat-card stat-card--accent doctor-metric-card">
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{summary.pending}</p>
            <p className="stat-description">Awaiting acceptance or rejection.</p>
          </div>
        </article>

        <article className="stat-card stat-card--secondary doctor-metric-card">
          <div className="stat-content">
            <h3>Accepted</h3>
            <p className="stat-value">{summary.accepted}</p>
            <p className="stat-description">Ready for consultation or completion.</p>
          </div>
        </article>

        <article className="stat-card stat-card--success doctor-metric-card">
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{summary.completed}</p>
            <p className="stat-description">Consultations already finalized.</p>
          </div>
        </article>
      </div>

      <div className="panel appointments-filter-panel doctor-filter-panel">
        <div className="appointments-filter-head">
          <h3>Status Filter</h3>
          <p>
            {loading
              ? "Loading appointments..."
              : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"} found`}
          </p>
        </div>

        <div className="appointments-filter-actions">
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
      {loading && <Loader label="Loading appointments..." />}

      {!loading && appointments.length === 0 && (
        <EmptyState
          title="No appointments found"
          message="Try another status filter or wait for new booking requests."
        />
      )}

      {!loading && appointments.length > 0 && (
        <div className="doctor-appointments-grid">
          {appointments.map((appointment) => (
            <article className="appointment-card" key={appointment._id}>
              <header className="appointment-card-head">
                <div>
                  <h3 className="appointment-patient">{appointment.patientName || "Patient"}</h3>
                  <p className="appointment-datetime">
                    {formatAppointmentDate(appointment.appointmentDate)} at {appointment.timeSlot || "N/A"}
                  </p>
                </div>
                <span className={`appointment-status appointment-status--${appointment.status?.toLowerCase() || "pending"}`}>
                  {appointment.status}
                </span>
              </header>

              <div className="appointment-info-grid">
                <div className="appointment-info-item">
                  <span className="appointment-label">Patient Email</span>
                  <span className="appointment-value">{appointment.patientEmail || "Not available"}</span>
                </div>

                <div className="appointment-info-item">
                  <span className="appointment-label">Reason</span>
                  <span className="appointment-value">{appointment.reason || "Not provided"}</span>
                </div>

                <div className="appointment-info-item appointment-info-item--full">
                  <span className="appointment-label">Appointment ID</span>
                  <span className="appointment-value appointment-value--mono">{appointment._id}</span>
                </div>

                {appointment.rejectionReason && (
                  <div className="appointment-info-item appointment-info-item--full">
                    <span className="appointment-label">Rejection Reason</span>
                    <span className="appointment-value">{appointment.rejectionReason}</span>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
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
                    {appointment.meetingLink && (
                      <a className="btn btn-outline" href={appointment.meetingLink} target="_blank" rel="noreferrer">
                        Join Jitsi
                      </a>
                    )}
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default DoctorAppointments;
