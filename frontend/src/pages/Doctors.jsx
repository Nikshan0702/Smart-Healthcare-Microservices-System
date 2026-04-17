import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DoctorCard from "../components/DoctorCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { doctorService } from "../services/doctorService";

const sortDoctors = (items, sortBy) => {
  const list = [...items];

  if (sortBy === "experience_desc") {
    list.sort((a, b) => Number(b.experience || 0) - Number(a.experience || 0));
    return list;
  }

  if (sortBy === "fee_asc") {
    list.sort((a, b) => Number(a.consultationFee || 0) - Number(b.consultationFee || 0));
    return list;
  }

  if (sortBy === "fee_desc") {
    list.sort((a, b) => Number(b.consultationFee || 0) - Number(a.consultationFee || 0));
    return list;
  }

  if (sortBy === "name_asc") {
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }

  list.sort((a, b) => {
    const verifiedRank = Number(Boolean(b.verified)) - Number(Boolean(a.verified));
    if (verifiedRank !== 0) return verifiedRank;

    const experienceRank = Number(b.experience || 0) - Number(a.experience || 0);
    if (experienceRank !== 0) return experienceRank;

    return Number(a.consultationFee || 0) - Number(b.consultationFee || 0);
  });

  return list;
};

function Doctors() {
  const [query, setQuery] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]);
  
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if we're in dashboard context (patient/doctor routes)
  const isInDashboard = location.pathname.includes('/patient/') || 
                        location.pathname.includes('/doctor/') || 
                        location.pathname.includes('/admin/');

  const extractSpecializations = (data) => {
    const unique = new Set();
    data.forEach((doctor) => {
      const specialization = (doctor.specialization || "").toString().trim();
      if (specialization) unique.add(specialization);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  };

  const loadDoctors = async (specialization = "") => {
    setLoading(true);
    setError("");

    try {
      const shouldLoadCatalog = allSpecializations.length === 0;
      let filteredDoctors = [];

      if (shouldLoadCatalog) {
        const [filteredData, allData] = await Promise.all([
          doctorService.getDoctors(specialization ? { specialization: specialization.trim() } : {}),
          doctorService.getDoctors()
        ]);
        filteredDoctors = Array.isArray(filteredData) ? filteredData : [];
        const doctorsForChips = Array.isArray(allData) ? allData : [];
        setAllSpecializations(extractSpecializations(doctorsForChips));
      } else {
        const filteredData = await doctorService.getDoctors(
          specialization ? { specialization: specialization.trim() } : {}
        );
        filteredDoctors = Array.isArray(filteredData) ? filteredData : [];
      }

      setDoctors(filteredDoctors);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctors.");
      setDoctors([]);
      setAllSpecializations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const visibleDoctors = useMemo(() => sortDoctors(doctors, sortBy), [doctors, sortBy]);

  const specializationChips = useMemo(() => {
    if (allSpecializations.length === 0) return [];
    return allSpecializations.slice(0, 8);
  }, [allSpecializations]);

  const activeFilterValue = appliedFilter.trim() || "All specializations";

  const handleSearch = (event) => {
    event.preventDefault();
    const normalized = query.trim();
    setAppliedFilter(normalized);
    loadDoctors(normalized);
  };

  const handleClear = () => {
    setQuery("");
    setAppliedFilter("");
    loadDoctors();
  };

  const applyChip = (specialization) => {
    setQuery(specialization);
    setAppliedFilter(specialization);
    loadDoctors(specialization);
  };

  // Apply different styling based on whether sidebar is present
  const sectionClassName = isInDashboard 
    ? "doctors-page dashboard-doctors-page" 
    : "section section-soft doctors-page";

  return (
    <section className={sectionClassName}>
      <div className={isInDashboard ? "dashboard-doctors-container" : "container"}>
        <form className="search-panel doctors-search-panel" onSubmit={handleSearch}>
          <div className="doctors-search-main">
            <label className="doctors-search-input-wrap" htmlFor="doctor-search-input">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="doctor-search-input"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by specialization (Cardiology, Neurology...)"
                aria-label="Search doctors by specialization"
              />
              <span className="doctors-search-shortcut">Press Enter</span>
            </label>

            <div className="doctors-search-actions">
              {(query.trim() || appliedFilter) && (
                <button className="btn btn-ghost doctors-clear-btn" type="button" onClick={handleClear}>
                  Clear
                </button>
              )}
              <button className="btn btn-primary doctors-search-btn" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="doctors-search-meta">
            <p className="doctors-filter-state">
              Active Filter: <strong>{activeFilterValue}</strong>
            </p>

            <label className="doctors-sort">
              Sort By
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="experience_desc">Experience (High to Low)</option>
                <option value="fee_asc">Consultation Fee (Low to High)</option>
                <option value="fee_desc">Consultation Fee (High to Low)</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </label>
          </div>

          {specializationChips.length > 0 && (
            <div className="doctors-chip-row">
              <button
                type="button"
                className={`filter-chip ${!appliedFilter ? "filter-chip--active" : ""}`}
                onClick={handleClear}
              >
                All
              </button>
              {specializationChips.map((specialization) => (
                <button
                  key={specialization}
                  type="button"
                  className={`filter-chip ${appliedFilter === specialization ? "filter-chip--active" : ""}`}
                  onClick={() => applyChip(specialization)}
                >
                  {specialization}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="doctors-toolbar">
          <p className="result-summary doctors-result-summary">
            <strong>{visibleDoctors.length}</strong> {visibleDoctors.length === 1 ? "doctor" : "doctors"} available
          </p>
          {appliedFilter && (
            <button type="button" className="btn btn-outline btn-small" onClick={handleClear}>
              Reset Filter
            </button>
          )}
        </div>

        {loading && <Loader label="Loading doctors..." />}
        {error && <p className="form-error inline-error">{error}</p>}

        {!loading && !error && visibleDoctors.length === 0 && (
          <EmptyState
            title="No doctors found"
            message="Try another specialization or clear filters to explore all available doctors."
            action={
              <button className="btn btn-outline" type="button" onClick={handleClear}>
                Show All Doctors
              </button>
            }
          />
        )}

        {!loading && visibleDoctors.length > 0 && (
          <div className="doctor-grid doctors-grid-enhanced">
            {visibleDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Doctors;