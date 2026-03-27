import { Link } from "react-router-dom";

const getInitials = (name = "") => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "DR";
};

function DoctorCard({ doctor }) {
  const name = doctor.name || "Doctor";
  const specialization = doctor.specialization || "General Medicine";

  return (
    <article className="doctor-card">
      <div className="doctor-card-top">
        <div className="doctor-id">
          <span className="doctor-avatar">{getInitials(name)}</span>
          <div>
            <h3>{name}</h3>
            <p className="doctor-specialization">{specialization}</p>
          </div>
        </div>

        <span className={doctor.verified ? "badge badge-success" : "badge"}>
          {doctor.verified ? "Verified" : "Pending"}
        </span>
      </div>

      <div className="doctor-meta-list">
        <p className="doctor-meta">
          <span>Hospital</span>
          {doctor.hospital || "To be updated"}
        </p>
        <p className="doctor-meta">
          <span>Experience</span>
          {doctor.experience || 0} years
        </p>
      </div>

      <p className="doctor-fee">
        LKR {doctor.consultationFee || 0}
        <span>Consultation Fee</span>
      </p>

      <Link to={`/doctors/${doctor._id}`} className="btn btn-primary btn-block">
        View Profile
      </Link>
    </article>
  );
}

export default DoctorCard;
