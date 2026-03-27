import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { doctorService } from "../services/doctorService";

function DoctorDetails() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctor = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await doctorService.getDoctorById(id);
        setDoctor(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [id]);

  if (loading) {
    return (
      <section className="section container">
        <Loader label="Loading profile..." />
      </section>
    );
  }

  if (error || !doctor) {
    return (
      <section className="section container">
        <EmptyState
          title="Doctor not available"
          message={error || "This doctor profile is currently unavailable."}
        />
      </section>
    );
  }

  return (
    <section className="section section-soft">
      <div className="container">
        <div className="details-hero">
          <div>
            <span className="eyebrow">Doctor Profile</span>
            <h1>{doctor.name}</h1>
            <p className="doctor-specialization">{doctor.specialization || "General Medicine"}</p>
          </div>
          <span className={doctor.verified ? "badge badge-success" : "badge"}>
            {doctor.verified ? "Verified" : "Pending Verification"}
          </span>
        </div>

        <div className="details-layout">
          <div className="details-card">
            <h2>Profile Overview</h2>
            <div className="details-grid">
              <div className="details-field">
                <strong>Email</strong>
                <span>{doctor.email}</span>
              </div>
              <div className="details-field">
                <strong>Hospital</strong>
                <span>{doctor.hospital || "Not specified"}</span>
              </div>
              <div className="details-field">
                <strong>Experience</strong>
                <span>{doctor.experience || 0} years</span>
              </div>
              <div className="details-field">
                <strong>Consultation Fee</strong>
                <span>LKR {doctor.consultationFee || 0}</span>
              </div>
            </div>
          </div>

          <div className="details-card">
            <h2>Availability</h2>
            {doctor.availability?.length ? (
              <ul className="availability-list">
                {doctor.availability.map((item, index) => (
                  <li key={`${item.day}-${index}`}>
                    <strong>{item.day}:</strong> {item.slots?.join(", ") || "No slots"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No availability listed yet.</p>
            )}
          </div>

          <div className="details-card">
            <h2>Appointments</h2>
            {isAuthenticated && user?.role === "PATIENT" && (
              <Link className="btn btn-primary" to={`/patient/book-appointment?doctorId=${doctor._id}`}>
                Book Appointment
              </Link>
            )}

            {isAuthenticated && user?.role !== "PATIENT" && (
              <p className="details-note">Only patient accounts can book appointments.</p>
            )}

            {!isAuthenticated && (
              <>
                <p className="details-note">Login with a patient account to book an appointment.</p>
                <Link className="btn btn-outline" to="/login">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DoctorDetails;
