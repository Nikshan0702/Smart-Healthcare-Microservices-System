import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";

function AdminDashboard() {
  const [doctorCount, setDoctorCount] = useState(0);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await doctorService.getDoctors();
        setDoctorCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setDoctorCount(0);
      }
    };

    loadDoctors();
  }, []);

  return (
    <section className="dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Create doctor accounts and doctor profiles through guided forms."
      />

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Doctor Profiles</h3>
          <p className="stat-value">{doctorCount}</p>
          <span>Profiles currently in system</span>
        </div>
        <div className="stat-card">
          <h3>Account Creation</h3>
          <p className="stat-value">Active</p>
          <span>Admin-controlled doctor onboarding</span>
        </div>
        <div className="stat-card">
          <h3>Patient Registration</h3>
          <p className="stat-value">Public</p>
          <span>Patients can self-register from public page</span>
        </div>
      </div>

      <div className="panel">
        <h2>Admin Actions</h2>
        <div className="quick-actions">
          <Link className="btn btn-primary" to="/admin/create-doctor-account">
            Create Doctor Account
          </Link>
          <Link className="btn btn-outline" to="/admin/create-doctor-profile">
            Create Doctor Profile
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
