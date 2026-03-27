import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { patientService } from "../../services/patientService";

function PatientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ title: "", description: "", file: null });

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await patientService.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.file) {
      setError("Please choose a file to upload.");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("file", form.file);

    setUploading(true);

    try {
      const data = await patientService.uploadMyReport(payload);
      setSuccess(data.message || "Report uploaded successfully.");
      setForm({ title: "", description: "", file: null });
      loadReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload report.");
    } finally {
      setUploading(false);
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
      <PageHeader title="My Medical Reports" subtitle="Upload and manage your reports/documents." />

      <form className="form-card" onSubmit={handleUpload}>
        <div className="form-grid two-col">
          <label>
            Report Title
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Blood Test / X-Ray"
            />
          </label>

          <label>
            File
            <input
              type="file"
              onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
              required
            />
          </label>

          <label className="span-2">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button className="btn btn-primary" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Report"}
        </button>
      </form>

      <div className="panel">
        <h2>Uploaded Reports</h2>
        {loading && <p>Loading reports...</p>}
        {!loading && reports.length === 0 && <p>No reports uploaded yet.</p>}

        {!loading && reports.length > 0 && (
          <div className="stats-grid">
            {reports.map((report) => (
              <div className="stat-card" key={report._id}>
                <h3>{report.title}</h3>
                <span>{report.originalName}</span>
                <span>{new Date(report.createdAt).toLocaleString()}</span>
                <span>{report.description || "No description"}</span>
                <button className="btn btn-outline" type="button" onClick={() => downloadReport(report)}>
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PatientReports;
