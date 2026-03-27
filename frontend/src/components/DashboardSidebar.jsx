import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linksByRole = {
  PATIENT: [
    { to: "/patient/dashboard", label: "Dashboard" },
    { to: "/patient/book-appointment", label: "Book Appointment" },
    { to: "/patient/appointments", label: "My Appointments" },
    { to: "/patient/profile", label: "My Profile" },
    { to: "/patient/reports", label: "My Reports" },
    { to: "/patient/prescriptions", label: "Prescriptions" }
  ],
  DOCTOR: [
    { to: "/doctor/dashboard", label: "Dashboard" },
    { to: "/doctor/appointments", label: "Appointments" },
    { to: "/doctor/profile", label: "My Profile" },
    { to: "/doctor/availability", label: "Availability" },
    { to: "/doctor/issue-prescription", label: "Issue Prescription" }
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/create-doctor-account", label: "Create Doctor Account" },
    { to: "/admin/create-doctor-profile", label: "Create Doctor Profile" }
  ]
};

function DashboardSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = linksByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand-wrap">
          <span className="sidebar-brand-mark">SH</span>
          <div>
            <div className="sidebar-brand">Smart Healthcare</div>
            <p className="sidebar-role">{user?.role?.toLowerCase() || "user"}</p>
          </div>
        </div>

        {user?.name && <p className="sidebar-user">Signed in as {user.name}</p>}
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="btn btn-outline sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default DashboardSidebar;
