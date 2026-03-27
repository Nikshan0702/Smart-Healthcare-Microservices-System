import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { appointmentService } from "../../services/appointmentService";
import { paymentService } from "../../services/paymentService";

const statusOptions = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const toInputDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

function MyAppointments() {
  const [status, setStatus] = useState("ALL");
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ appointmentDate: "", timeSlot: "", reason: "" });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const appointmentPromise = appointmentService.getMyAppointments(status === "ALL" ? {} : { status });
      const paymentPromise = paymentService.getMyPayments();
      const [appointmentData, paymentData] = await Promise.all([appointmentPromise, paymentPromise]);
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments.");
      setAppointments([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [status]);

  const paymentsByAppointment = useMemo(() => {
    const map = {};
    payments.forEach((payment) => {
      map[payment.appointmentId] = payment;
    });
    return map;
  }, [payments]);

  const startEdit = (appointment) => {
    setEditingId(appointment._id);
    setEditForm({
      appointmentDate: toInputDate(appointment.appointmentDate),
      timeSlot: appointment.timeSlot,
      reason: appointment.reason
    });
  };

  const saveEdit = async () => {
    setError("");
    setSuccess("");

    try {
      await appointmentService.updateMyAppointment(editingId, editForm);
      setSuccess("Appointment updated successfully.");
      setEditingId("");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update appointment.");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setError("");
    setSuccess("");

    try {
      await appointmentService.cancelMyAppointment(appointmentId);
      setSuccess("Appointment cancelled successfully.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const payForAppointment = async (appointment) => {
    setError("");
    setSuccess("");

    try {
      await paymentService.payForAppointment({
        appointmentId: appointment._id,
        amount: Number(appointment.consultationFee || 0)
      });
      setSuccess("Payment completed successfully.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader
        title="My Appointments"
        subtitle="Track statuses, update pending appointments, complete payments, and join consultations."
      />

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

      {!loading && appointments.length === 0 && <p>No appointments found for selected filter.</p>}

      {!loading && appointments.length > 0 && (
        <div className="stats-grid">
          {appointments.map((appointment) => {
            const payment = paymentsByAppointment[appointment._id];
            const paymentStatus = payment?.status || "PENDING";

            return (
              <div className="stat-card" key={appointment._id}>
                <h3>{appointment.doctorName}</h3>
                <p className="stat-value">{appointment.status}</p>
                <span>
                  {formatDate(appointment.appointmentDate)} at {appointment.timeSlot}
                </span>
                <span>Reason: {appointment.reason}</span>
                <span>Fee: LKR {appointment.consultationFee || 0}</span>
                <span>Payment: {paymentStatus}</span>

                {editingId === appointment._id ? (
                  <div className="form-grid">
                    <label>
                      New Date
                      <input
                        type="date"
                        value={editForm.appointmentDate}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, appointmentDate: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      New Time Slot
                      <input
                        type="text"
                        value={editForm.timeSlot}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, timeSlot: event.target.value }))}
                      />
                    </label>
                    <label>
                      Reason
                      <textarea
                        rows="3"
                        value={editForm.reason}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, reason: event.target.value }))}
                      />
                    </label>
                    <div className="quick-actions">
                      <button type="button" className="btn btn-primary" onClick={saveEdit}>
                        Save
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setEditingId("")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="quick-actions">
                    {appointment.status === "PENDING" && (
                      <>
                        <button type="button" className="btn btn-outline" onClick={() => startEdit(appointment)}>
                          Modify
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => cancelAppointment(appointment._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appointment.status === "ACCEPTED" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => cancelAppointment(appointment._id)}
                      >
                        Cancel
                      </button>
                    )}

                    {appointment.status === "ACCEPTED" && paymentStatus !== "PAID" && (
                      <button type="button" className="btn btn-primary" onClick={() => payForAppointment(appointment)}>
                        Pay Now
                      </button>
                    )}

                    {appointment.status === "ACCEPTED" && appointment.meetingLink && (
                      <a className="btn btn-primary" href={appointment.meetingLink} target="_blank" rel="noreferrer">
                        Join Consultation
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyAppointments;
