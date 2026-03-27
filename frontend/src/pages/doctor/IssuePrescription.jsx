import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { patientService } from "../../services/patientService";

const emptyMedicine = { name: "", dosage: "", instructions: "" };

function IssuePrescription() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    patientId: searchParams.get("patientId") || "",
    appointmentId: searchParams.get("appointmentId") || "",
    notes: "",
    medicines: [{ ...emptyMedicine }]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);
  const [patientReports, setPatientReports] = useState([]);

  const loadHistory = async () => {
    try {
      const data = await patientService.getDoctorPrescriptions();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (form.patientId) {
      loadPatientReports(form.patientId);
    }
  }, []);

  const updateMedicine = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine
      )
    }));
  };

  const addMedicine = () => {
    setForm((prev) => ({ ...prev, medicines: [...prev.medicines, { ...emptyMedicine }] }));
  };

  const removeMedicine = (index) => {
    setForm((prev) => {
      if (prev.medicines.length === 1) return prev;
      return {
        ...prev,
        medicines: prev.medicines.filter((_, medicineIndex) => medicineIndex !== index)
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        patientId: form.patientId,
        appointmentId: form.appointmentId,
        notes: form.notes,
        medicines: form.medicines
      };
      const data = await patientService.issuePrescription(payload);
      setSuccess(data.message || "Prescription issued successfully.");
      setForm((prev) => ({ ...prev, notes: "", medicines: [{ ...emptyMedicine }] }));
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue prescription.");
    } finally {
      setSaving(false);
    }
  };

  const loadPatientReports = async (patientId) => {
    if (!patientId) {
      setPatientReports([]);
      return;
    }

    try {
      const data = await patientService.getReportsByPatient(patientId);
      setPatientReports(Array.isArray(data) ? data : []);
    } catch {
      setPatientReports([]);
    }
  };

  const downloadReport = async (report) => {
    setError("");

    try {
      const blob = await patientService.downloadReport(report._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download report.");
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader title="Issue Prescription" subtitle="Create a simple digital prescription for a patient." />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <label>
            Patient ID
            <input
              type="text"
              value={form.patientId}
              onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
              required
            />
          </label>
          <div className="quick-actions">
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadPatientReports(form.patientId)}
            >
              Load Patient Reports
            </button>
          </div>

          <label>
            Appointment ID (Optional)
            <input
              type="text"
              value={form.appointmentId}
              onChange={(event) => setForm((prev) => ({ ...prev, appointmentId: event.target.value }))}
            />
          </label>

          <label className="span-2">
            Notes
            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>
        </div>

        <div className="panel">
          <h3>Medicines</h3>
          {form.medicines.map((medicine, index) => (
            <div className="form-grid three-col" key={`medicine-${index}`}>
              <label>
                Name
                <input
                  type="text"
                  value={medicine.name}
                  onChange={(event) => updateMedicine(index, "name", event.target.value)}
                  required
                />
              </label>
              <label>
                Dosage
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={(event) => updateMedicine(index, "dosage", event.target.value)}
                />
              </label>
              <label>
                Instructions
                <input
                  type="text"
                  value={medicine.instructions}
                  onChange={(event) => updateMedicine(index, "instructions", event.target.value)}
                />
              </label>
              <button className="btn btn-outline" type="button" onClick={() => removeMedicine(index)}>
                Remove Medicine
              </button>
            </div>
          ))}

          <button className="btn btn-outline" type="button" onClick={addMedicine}>
            Add Medicine
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Issuing..." : "Issue Prescription"}
        </button>
      </form>

      <div className="panel">
        <h2>Patient Reports</h2>
        {patientReports.length === 0 && <p>No reports loaded for this patient.</p>}
        {patientReports.length > 0 && (
          <div className="stats-grid">
            {patientReports.map((report) => (
              <div className="stat-card" key={report._id}>
                <h3>{report.title}</h3>
                <span>{report.originalName}</span>
                <span>{new Date(report.createdAt).toLocaleString()}</span>
                <button className="btn btn-outline" type="button" onClick={() => downloadReport(report)}>
                  Download Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Previously Issued Prescriptions</h2>
        {history.length === 0 && <p>No prescriptions issued yet.</p>}
        {history.length > 0 && (
          <div className="stats-grid">
            {history.map((item) => (
              <div className="stat-card" key={item._id}>
                <h3>{item.patientName}</h3>
                <span>Patient ID: {item.patientId}</span>
                <span>Appointment: {item.appointmentId || "N/A"}</span>
                <span>Issued: {new Date(item.issuedDate).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default IssuePrescription;
