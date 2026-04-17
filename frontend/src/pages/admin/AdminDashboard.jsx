import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";
import { paymentService } from "../../services/paymentService";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

function AdminDashboard() {
  const [doctorCount, setDoctorCount] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [doctorsResult, paymentsResult] = await Promise.allSettled([
          doctorService.getDoctors(),
          paymentService.getAllPayments()
        ]);

        if (ignore) {
          return;
        }

        const doctors =
          doctorsResult.status === "fulfilled" && Array.isArray(doctorsResult.value)
            ? doctorsResult.value
            : [];
        const paymentRecords =
          paymentsResult.status === "fulfilled" && Array.isArray(paymentsResult.value)
            ? paymentsResult.value
            : [];

        setDoctorCount(doctors.length);
        setPayments(paymentRecords);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const revenueCurrency = payments.find((payment) => payment.currency)?.currency || "LKR";
  const paidPayments = payments.filter((payment) => payment.status === "PAID");
  const pendingPayments = payments.filter((payment) => payment.status === "PENDING");
  const failedPayments = payments.filter((payment) => payment.status === "FAILED");
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const statCards = [
    {
      title: "Total Doctor Profiles",
      value: loading ? "..." : doctorCount,
      description: "Profiles currently available in the system",
      color: "primary",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      title: "All Payments",
      value: loading ? "..." : payments.length,
      description: "Every payment record across patient accounts",
      color: "secondary",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      )
    },
    {
      title: "Paid Revenue",
      value: loading ? "..." : formatCurrency(totalRevenue, revenueCurrency),
      description: `${paidPayments.length} payment${paidPayments.length === 1 ? "" : "s"} marked as paid`,
      color: "success",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      title: "Pending Payments",
      value: loading ? "..." : pendingPayments.length,
      description: "Payments still waiting for confirmation",
      color: "accent",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      )
    },
    {
      title: "Failed Payments",
      value: loading ? "..." : failedPayments.length,
      description: "Records that need follow-up or retry",
      color: "primary",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    }
  ];

  const adminActions = [
    {
      title: "Create Doctor Account",
      description: "Step 1: create login credentials in auth service.",
      to: "/admin/create-doctor-account",
      color: "primary",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    },
    {
      title: "Create Doctor Profile",
      description: "Step 2: select the doctor account and create its profile.",
      to: "/admin/create-doctor-profile",
      color: "secondary",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="12" y2="17" />
        </svg>
      )
    }
  ];

  return (
    <section className="dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage doctor onboarding and monitor all patient payment activity from one place."
      />

      <div className="dashboard-stats">
        <div className="stats-grid">
          {statCards.map((stat) => (
            <div key={stat.title} className={`stat-card stat-card--${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value-wrapper">
                  <span className="stat-value">{stat.value}</span>
                </div>
                <p className="stat-description">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions-section">
          <h2>Admin Actions</h2>
          <div className="quick-actions-grid">
            {adminActions.map((action) => (
              <Link key={action.title} to={action.to} className={`action-card action-card--${action.color}`}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel admin-payment-panel">
          <div className="admin-payment-panel-head">
            <div>
              <h3>All Payment Details</h3>
              <p>
                Review every payment record across patient accounts, including status, amount, method, and timestamps.
              </p>
            </div>
            <span>{loading ? "..." : `${payments.length} record${payments.length === 1 ? "" : "s"}`}</span>
          </div>

          {loading ? (
            <p>Loading payment details...</p>
          ) : payments.length === 0 ? (
            <p className="admin-payment-empty">No payment records have been created yet.</p>
          ) : (
            <div className="admin-payment-list">
              {payments.map((payment) => (
                <article key={payment._id} className="admin-payment-card">
                  <div className="admin-payment-card-head">
                    <div>
                      <h4>{payment.patientName || "Unknown Patient"}</h4>
                      <p>{payment.patientEmail || payment.patientId}</p>
                    </div>
                    <div className="admin-payment-card-amount">
                      <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                      <span className={`payment-status payment-status--${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>

                  <div className="admin-payment-grid">
                    <div className="admin-payment-item">
                      <span>Appointment</span>
                      <strong>{payment.appointmentId}</strong>
                    </div>
                    <div className="admin-payment-item">
                      <span>Patient ID</span>
                      <strong>{payment.patientId}</strong>
                    </div>
                    <div className="admin-payment-item">
                      <span>Method</span>
                      <strong>{(payment.method || "MOCK_CARD").replace(/_/g, " ")}</strong>
                    </div>
                    <div className="admin-payment-item">
                      <span>Transaction</span>
                      <strong>{payment.transactionRef || payment.stripePaymentIntentId || "-"}</strong>
                    </div>
                    <div className="admin-payment-item">
                      <span>Created</span>
                      <strong>{formatDateTime(payment.createdAt)}</strong>
                    </div>
                    <div className="admin-payment-item">
                      <span>Paid At</span>
                      <strong>{formatDateTime(payment.paidAt)}</strong>
                    </div>
                  </div>

                  {payment.failureReason && (
                    <p className="admin-payment-failure">{payment.failureReason}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="panel admin-note-panel">
          <h3>Onboarding Sequence</h3>
          <p>Create a doctor account first, then select that account while creating the profile.</p>
          <p>This ensures appointments are assigned to the correct doctor login and payment records stay traceable.</p>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
