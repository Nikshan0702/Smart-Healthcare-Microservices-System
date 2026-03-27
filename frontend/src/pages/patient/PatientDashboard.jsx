import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";

function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcoming: 0,
    reports: 0,
    prescriptions: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [appointments, reports, prescriptions] = await Promise.all([
          appointmentService.getMyAppointments(),
          patientService.getMyReports(),
          patientService.getMyPrescriptions()
        ]);

        const upcomingCount = Array.isArray(appointments)
          ? appointments.filter((item) => ["PENDING", "ACCEPTED"].includes(item.status)).length
          : 0;

        setStats({
          upcoming: upcomingCount,
          reports: Array.isArray(reports) ? reports.length : 0,
          prescriptions: Array.isArray(prescriptions) ? prescriptions.length : 0
        });
      } catch {
        setStats({
          upcoming: 0,
          reports: 0,
          prescriptions: 0
        });
      }
    };

    loadStats();
  }, []);

  return (
    <section className="dashboard-page">
      <PageHeader
        title={`Welcome, ${user?.name || "Patient"}`}
        subtitle="Manage your healthcare journey from a single dashboard."
      />

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Upcoming Appointments</h3>
          <p className="stat-value">{stats.upcoming}</p>
          <span>Pending or accepted appointments</span>
        </div>
        <div className="stat-card">
          <h3>Uploaded Reports</h3>
          <p className="stat-value">{stats.reports}</p>
          <span>Medical reports available for doctors</span>
        </div>
        <div className="stat-card">
          <h3>Prescriptions</h3>
          <p className="stat-value">{stats.prescriptions}</p>
          <span>Issued by doctors</span>
        </div>
      </div>

      <div className="panel">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/patient/book-appointment" className="btn btn-primary">
            Book Appointment
          </Link>
          <Link to="/patient/appointments" className="btn btn-outline">
            View Appointments
          </Link>
          <Link to="/patient/reports" className="btn btn-outline">
            Manage Reports
          </Link>
          <Link to="/patient/prescriptions" className="btn btn-outline">
            View Prescriptions
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PatientDashboard;
