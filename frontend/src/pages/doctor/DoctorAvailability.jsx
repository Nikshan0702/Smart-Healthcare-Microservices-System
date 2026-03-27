import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";

const emptyRow = { day: "", slots: "" };

function DoctorAvailability() {
  const [rows, setRows] = useState([emptyRow]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await doctorService.getMyProfile();
        setProfileExists(true);

        if (Array.isArray(data.availability) && data.availability.length > 0) {
          const mapped = data.availability.map((item) => ({
            day: item.day,
            slots: (item.slots || []).join(", ")
          }));
          setRows(mapped);
        } else {
          setRows([emptyRow]);
        }
      } catch (err) {
        setProfileExists(false);
        setError(err.response?.data?.message || "Doctor profile not found.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { ...emptyRow }]);
  };

  const removeRow = (index) => {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const availability = rows
      .filter((row) => row.day.trim())
      .map((row) => ({
        day: row.day.trim(),
        slots: row.slots
          .split(",")
          .map((slot) => slot.trim())
          .filter(Boolean)
      }));

    setSaving(true);

    try {
      const data = await doctorService.updateMyAvailability({ availability });
      setSuccess(data.message || "Availability updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader
        title="Availability"
        subtitle="Add daily availability and time slots separated by commas."
      />

      {loading && <Loader label="Loading availability..." />}

      {!loading && !profileExists && (
        <EmptyState
          title="Profile not available"
          message={error || "Your doctor profile is not created yet by admin."}
        />
      )}

      {!loading && profileExists && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="availability-grid">
            {rows.map((row, index) => (
              <div className="availability-row" key={`${row.day}-${index}`}>
                <input
                  type="text"
                  placeholder="Day (e.g., Monday)"
                  value={row.day}
                  onChange={(event) => updateRow(index, "day", event.target.value)}
                />
                <input
                  type="text"
                  placeholder="Slots (e.g., 09:00, 10:00)"
                  value={row.slots}
                  onChange={(event) => updateRow(index, "slots", event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => removeRow(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <button type="button" className="btn btn-outline" onClick={addRow}>
              Add Day
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
        </form>
      )}
    </section>
  );
}

export default DoctorAvailability;
