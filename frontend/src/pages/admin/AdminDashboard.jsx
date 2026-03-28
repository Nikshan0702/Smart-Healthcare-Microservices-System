import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";

function AdminDashboard() {
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const data = await doctorService.getDoctors();
        setDoctorCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setDoctorCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

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
      title: "Doctor Account Setup",
      value: "Enabled",
      description: "Admins can create doctor login credentials",
      color: "success",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    {
      title: "Patient Registration",
      value: "Open",
      description: "Patients can self-register from the public portal",
      color: "accent",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
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
      description: "Step 2: link the doctor profile with the doctor user ID.",
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
        subtitle="Manage doctor onboarding from account creation to profile activation."
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

        <div className="panel admin-note-panel">
          <h3>Onboarding Sequence</h3>
          <p>Create a doctor account first, then create a profile using the generated user ID.</p>
          <p>This ensures appointments are assigned to the correct doctor login.</p>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
