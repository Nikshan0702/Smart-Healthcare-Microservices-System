import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { appointmentService } from "../../services/appointmentService";
import { paymentService } from "../../services/paymentService";

const statusOptions = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const toInputDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

function MyAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState("ALL");
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingStripeResult, setProcessingStripeResult] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ appointmentDate: "", timeSlot: "", reason: "" });

  const loadData = useCallback(async () => {
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
  }, [status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const paymentResult = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (!paymentResult) {
      return undefined;
    }

    const clearPaymentParams = () => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("payment");
      nextParams.delete("session_id");
      nextParams.delete("appointmentId");
      setSearchParams(nextParams, { replace: true });
    };

    if (paymentResult === "cancelled") {
      setError("Payment was cancelled before completion.");
      clearPaymentParams();
      return undefined;
    }

    if (paymentResult !== "success" || !sessionId) {
      return undefined;
    }

    let ignore = false;

    const syncStripePayment = async () => {
      setProcessingStripeResult(true);
      setError("");

      try {
        const result = await paymentService.getCheckoutSessionStatus(sessionId);

        if (ignore) {
          return;
        }

        if (result.payment?.status === "PAID") {
          setSuccess("Payment completed successfully.");
        } else {
          setSuccess("Payment is being confirmed. Refresh again in a few seconds if the status stays pending.");
        }

        await loadData();
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to confirm Stripe payment status.");
        }
      } finally {
        if (!ignore) {
          setProcessingStripeResult(false);
          clearPaymentParams();
        }
      }
    };

    syncStripePayment();

    return () => {
      ignore = true;
    };
  }, [loadData, searchParams, setSearchParams]);

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
      const result = await paymentService.createCheckoutSession({
        appointmentId: appointment._id,
        amount: Number(appointment.consultationFee || 0)
      });

      if (!result.checkoutUrl) {
        throw new Error("Stripe Checkout URL was not returned");
      }

      window.location.assign(result.checkoutUrl);
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

      <div className="panel appointments-filter-panel">
        <div className="appointments-filter-head">
          <h3>Status Filter</h3>
          <p>{loading ? "Loading..." : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"} found`}</p>
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
      {loading && <p>Loading appointments...</p>}
      {!loading && processingStripeResult && <p>Confirming Stripe payment...</p>}

      {!loading && appointments.length === 0 && (
        <p className="appointments-empty">No appointments found for selected filter.</p>
      )}

      {!loading && appointments.length > 0 && (
        <div className="patient-appointments-grid">
          {appointments.map((appointment) => {
            const payment = paymentsByAppointment[appointment._id];
            const paymentStatus = payment?.status || "PENDING";

            return (
              <article className="appointment-card" key={appointment._id}>
                <header className="appointment-card-head">
                  <div>
                    <h3 className="appointment-patient">{appointment.doctorName}</h3>
                    <p className="appointment-datetime">
                      {formatDate(appointment.appointmentDate)} at {appointment.timeSlot}
                    </p>
                  </div>
                  <span className={`appointment-status appointment-status--${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </header>

                <div className="appointment-info-grid">
                  <div className="appointment-info-item">
                    <span className="appointment-label">Reason</span>
                    <span className="appointment-value">{appointment.reason}</span>
                  </div>

                  <div className="appointment-info-item">
                    <span className="appointment-label">Consultation Fee</span>
                    <span className="appointment-value">LKR {appointment.consultationFee || 0}</span>
                  </div>

                  <div className="appointment-info-item">
                    <span className="appointment-label">Payment</span>
                    <span className={`payment-status payment-status--${paymentStatus.toLowerCase()}`}>
                      {paymentStatus}
                    </span>
                  </div>

                  {appointment.rejectionReason && (
                    <div className="appointment-info-item appointment-info-item--full">
                      <span className="appointment-label">Rejection Reason</span>
                      <span className="appointment-value">{appointment.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {editingId === appointment._id ? (
                  <div className="appointment-edit-form form-grid two-col">
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
                    <label className="span-2">
                      Reason
                      <textarea
                        rows="3"
                        value={editForm.reason}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, reason: event.target.value }))}
                      />
                    </label>
                    <div className="appointment-edit-actions span-2">
                      <button type="button" className="btn btn-primary" onClick={saveEdit}>
                        Save
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setEditingId("")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="appointment-actions">
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyAppointments;
