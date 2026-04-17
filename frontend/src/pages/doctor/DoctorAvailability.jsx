import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { doctorService } from "../../services/doctorService";
import { isValidDateKey, normalizeString } from "../../utils/validators";

const emptyRow = { date: "", slots: [] };

const toInputDate = (value) => {
  if (!value) return "";
  const asText = value.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(asText)) return asText;

  const parsed = new Date(asText);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const getTodayDate = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const formatDateLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

// Convert 24-hour format (HH:MM) to 12-hour format for display
const formatTimeForDisplay = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Keep time in 24-hour format for storage (already in HH:MM from time input)
const formatTimeForStorage = (time24) => {
  return time24; // Time input already returns HH:MM format
};

function DoctorAvailability() {
  const [rows, setRows] = useState([emptyRow]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileExists, setProfileExists] = useState(true);
  const [legacyCount, setLegacyCount] = useState(0);
  const minDate = useMemo(() => getTodayDate(), []);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await doctorService.getMyProfile();
        setProfileExists(true);

        const availabilityEntries = Array.isArray(data.availability) ? data.availability : [];
        let legacyEntries = 0;

        const mapped = availabilityEntries
          .map((item) => {
            const date = toInputDate(item?.date);
            if (!date) {
              legacyEntries += 1;
              return null;
            }

            return {
              date,
              slots: Array.isArray(item.slots) ? [...item.slots] : []
            };
          })
          .filter(Boolean);

        setRows(mapped.length > 0 ? mapped : [emptyRow]);
        setLegacyCount(legacyEntries);
      } catch (err) {
        setProfileExists(false);
        setError(err.response?.data?.message || "Doctor profile not found.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateRowDate = (index, date) => {
    setRows((prev) => prev.map((row, rowIndex) => 
      rowIndex === index ? { ...row, date } : row
    ));
  };

  const addSlot = (rowIndex) => {
    setRows((prev) => prev.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, slots: [...row.slots, ""] };
      }
      return row;
    }));
  };

  const updateSlot = (rowIndex, slotIndex, value) => {
    setRows((prev) => prev.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const updatedSlots = [...row.slots];
        updatedSlots[slotIndex] = value;
        return { ...row, slots: updatedSlots };
      }
      return row;
    }));
  };

  const removeSlot = (rowIndex, slotIndex) => {
    setRows((prev) => prev.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const updatedSlots = row.slots.filter((_, sIdx) => sIdx !== slotIndex);
        return { ...row, slots: updatedSlots };
      }
      return row;
    }));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { date: "", slots: [] }]);
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
      .filter((row) => row.date.trim())
      .map((row) => ({
        date: normalizeString(row.date),
        slots: row.slots
          .filter(slot => slot && slot.trim())
          .map(slot => slot.trim()) // Keep as is (HH:MM format from time input)
      }))
      .filter(entry => entry.slots.length > 0);

    if (availability.length === 0) {
      setError("Add at least one dated slot entry.");
      return;
    }

    if (availability.some((entry) => !isValidDateKey(entry.date))) {
      setError("Each availability date must be a valid date.");
      return;
    }

    // Validate time slots (now expecting HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const hasInvalidSlot = availability.some((entry) =>
      entry.slots.some((slot) => {
        if (!slot) return true;
        if (!timeRegex.test(slot)) return true;
        const [hours, minutes] = slot.split(":");
        const hour = parseInt(hours);
        const minute = parseInt(minutes);
        if (hour < 0 || hour > 23) return true;
        if (minute < 0 || minute > 59) return true;
        return false;
      })
    );

    if (hasInvalidSlot) {
      setError("Each slot must be a valid time in HH:MM format (e.g., 09:00, 14:30).");
      return;
    }

    // Check for duplicate slots within the same date
    const hasDuplicateSlots = availability.some((entry) => {
      const uniqueSlots = new Set(entry.slots);
      return uniqueSlots.size !== entry.slots.length;
    });

    if (hasDuplicateSlots) {
      setError("Duplicate time slots found for the same date. Please remove duplicates.");
      return;
    }

    setSaving(true);

    try {
      const data = await doctorService.updateMyAvailability({ availability });
      setSuccess(data.message || "Availability updated successfully.");
      setLegacyCount(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  const configuredDateCount = rows.filter((row) => row.date.trim()).length;
  const configuredSlotCount = rows.reduce((total, row) => total + row.slots.filter(slot => slot && slot.trim()).length, 0);

  const upcomingEntries = rows
    .filter((row) => row.date.trim() && row.slots.length > 0)
    .map((row) => ({ 
      date: row.date.trim(), 
      slotCount: row.slots.filter(slot => slot && slot.trim()).length,
      slots: row.slots.filter(slot => slot && slot.trim())
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <section className="dashboard-page doctor-page doctor-availability-page">
      <PageHeader
        title="Availability"
        subtitle="Publish date-specific time slots. Patients can only book slots you list here."
      />

      {loading && <Loader label="Loading availability..." />}

      {!loading && !profileExists && (
        <EmptyState
          title="Profile not available"
          message={error || "Your doctor profile is not created yet by admin."}
        />
      )}

      {!loading && profileExists && (
        <div className="availability-layout">
          <form className="form-card availability-form-card" onSubmit={handleSubmit}>
            {legacyCount > 0 && (
              <p className="form-error">
                {legacyCount} legacy day-based availability entr{legacyCount === 1 ? "y" : "ies"} found. Save dated
                availability to replace them.
              </p>
            )}

            <div className="availability-toolbar">
              <div className="availability-kpis">
                <div className="availability-kpi">
                  <strong>{configuredDateCount}</strong>
                  <span>Dates</span>
                </div>
                <div className="availability-kpi">
                  <strong>{configuredSlotCount}</strong>
                  <span>Slots</span>
                </div>
              </div>

              <div className="availability-toolbar-actions">
                <button type="button" className="btn btn-outline availability-add-btn" onClick={addRow}>
                  Add Date
                </button>
              </div>
            </div>

            <div className="availability-grid doctor-availability-grid">
              {rows.map((row, index) => (
                <article className="availability-row-card" key={`${row.date || "new"}-${index}`}>
                  <div className="availability-row-head">
                    <h3>Availability Entry {index + 1}</h3>
                    <button
                      type="button"
                      className="btn btn-outline btn-small availability-remove-btn"
                      onClick={() => removeRow(index)}
                      disabled={rows.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="availability-row">
                    <label className="availability-field">
                      <span>Date</span>
                      <input
                        type="date"
                        className="availability-input"
                        min={minDate}
                        value={row.date}
                        onChange={(event) => updateRowDate(index, event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="availability-slots-section">
                    <div className="availability-slots-header">
                      <label className="availability-field-label">Time Slots</label>
                      <button
                        type="button"
                        className="btn btn-small btn-outline add-slot-btn"
                        onClick={() => addSlot(index)}
                      >
                        + Add Time Slot
                      </button>
                    </div>

                    <div className="time-slots-list">
                      {row.slots.length === 0 && (
                        <p className="no-slots-hint">No time slots added. Click "Add Time Slot" to add appointment times.</p>
                      )}
                      
                      {row.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="time-slot-item">
                          <input
                            type="time"
                            className="time-slot-input"
                            value={slot}
                            onChange={(e) => updateSlot(index, slotIndex, e.target.value)}
                            step="60"
                          />
                          <span className="time-slot-preview">
                            {slot && formatTimeForDisplay(slot)}
                          </span>
                          <button
                            type="button"
                            className="btn btn-small btn-ghost remove-slot-btn"
                            onClick={() => removeSlot(index, slotIndex)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {row.slots.length > 0 && (
                      <p className="availability-row-note">
                        {row.slots.filter(s => s && s.trim()).length} time slot{row.slots.filter(s => s && s.trim()).length === 1 ? "" : "s"} configured for this date
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="availability-actions">
              <button type="submit" className="btn btn-primary availability-submit-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Availability"}
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}
          </form>

          <aside className="availability-side">
            <div className="panel">
              <h3>Booking Logic</h3>
              <ul className="profile-tip-list">
                <li>Only the listed dated slots are shown on doctor profile and booking pages.</li>
                <li>After a patient books a slot, that slot is hidden until the booking is cancelled.</li>
                <li>Use the time picker to add any number of time slots for each date.</li>
                <li>Slots are displayed in 24-hour format for input but shown as 12-hour format for preview.</li>
                <li>Duplicate time slots on the same date will be rejected.</li>
              </ul>
            </div>

            <div className="panel">
              <h3>Upcoming Slots Preview</h3>
              {upcomingEntries.length === 0 ? (
                <p className="doctor-muted-note">No upcoming availability entries.</p>
              ) : (
                <div>
                  {upcomingEntries.map((entry, idx) => (
                    <div key={`${entry.date}-${idx}`} className="upcoming-date-group">
                      <div className="upcoming-date-header">
                        <strong>{formatDateLabel(entry.date)}</strong>
                        <span className="slot-count-badge">{entry.slotCount} slots</span>
                      </div>
                      <ul className="doctor-slot-preview-list">
                        {entry.slots.slice(0, 3).map((slot, slotIdx) => (
                          <li key={slotIdx}>
                            <span className="slot-time">{formatTimeForDisplay(slot)}</span>
                          </li>
                        ))}
                        {entry.slots.length > 3 && (
                          <li className="more-slots">+{entry.slots.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default DoctorAvailability;