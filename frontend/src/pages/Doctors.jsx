import { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { doctorService } from "../services/doctorService";

function Doctors() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  const loadDoctors = async (specialization = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await doctorService.getDoctors(
        specialization ? { specialization: specialization.trim() } : {}
      );
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctors.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadDoctors(query);
  };

  const handleClear = () => {
    setQuery("");
    loadDoctors();
  };

  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-header simple-header">
          <div>
            <h1>Doctors</h1>
            <p>Search by specialization.</p>
          </div>
        </div>

        <form className="search-panel" onSubmit={handleSearch}>
          <div className="search-bar">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cardiology, Dermatology..."
              aria-label="Search doctors by specialization"
            />

            <div className="search-actions">
              {query.trim() && (
                <button className="btn btn-ghost" type="button" onClick={handleClear}>
                  Clear
                </button>
              )}
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </div>
        </form>

        {!loading && !error && (
          <p className="result-summary">
            {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"}
          </p>
        )}

        {loading && <Loader label="Loading doctors..." />}
        {error && <p className="form-error inline-error">{error}</p>}

        {!loading && !error && doctors.length === 0 && (
          <EmptyState title="No doctors found" message="Try another search." />
        )}

        {!loading && doctors.length > 0 && (
          <div className="doctor-grid">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Doctors;
