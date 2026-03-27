import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { appointmentService } from "../../services/appointmentService";
import { doctorService } from "../../services/doctorService";

function DoctorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [profileData, appointments] = await Promise.all([
          doctorService.getMyProfile(),
          appointmentService.getDoctorAppointments()
        ]);
        setProfile(profileData);
        setAppointmentCount(Array.isArray(appointments) ? appointments.length : 0);
      } catch {
        setProfile(null);
        setAppointmentCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <section className="dashboard-page">
      <PageHeader
        title={`Welcome, Dr. ${user?.name || "Doctor"}`}
        subtitle="Track your profile and keep your consultation availability updated."
      />

      {loading && <Loader label="Loading doctor dashboard..." />}

      {!loading && !profile && (
        <EmptyState
          title="Profile not found"
          message="Ask admin to create your doctor profile, then refresh this page."
          action={
            <Link className="btn btn-primary" to="/doctor/profile">
              Open Profile Page
            </Link>
          }
        />
      )}

      {!loading && profile && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Specialization</h3>
              <p className="stat-value">{profile.specialization}</p>
              <span>Medical expertise</span>
            </div>
            <div className="stat-card">
              <h3>Hospital</h3>
              <p className="stat-value">{profile.hospital || "Not set"}</p>
              <span>Current practice location</span>
            </div>
            <div className="stat-card">
              <h3>Availability Slots</h3>
              <p className="stat-value">{profile.availability?.length || 0}</p>
              <span>Configured day entries</span>
            </div>
            <div className="stat-card">
              <h3>Appointment Requests</h3>
              <p className="stat-value">{appointmentCount}</p>
              <span>Total appointments assigned to you</span>
            </div>
          </div>

          <div className="panel">
            <h2>Doctor Actions</h2>
            <div className="quick-actions">
              <Link className="btn btn-primary" to="/doctor/appointments">
                Manage Appointments
              </Link>
              <Link className="btn btn-primary" to="/doctor/profile">
                Update Profile
              </Link>
              <Link className="btn btn-outline" to="/doctor/availability">
                Update Availability
              </Link>
              <Link className="btn btn-outline" to="/doctor/issue-prescription">
                Issue Prescription
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DoctorDashboard;
