import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { patientService } from "../../services/patientService";

function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrescriptions = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await patientService.getMyPrescriptions();
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load prescriptions.");
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  return (
    <section className="dashboard-page">
      <PageHeader title="My Prescriptions" subtitle="View prescriptions issued by doctors." />

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading prescriptions...</p>}
      {!loading && prescriptions.length === 0 && <p>No prescriptions found.</p>}

      {!loading && prescriptions.length > 0 && (
        <div className="stats-grid">
          {prescriptions.map((item) => (
            <div className="stat-card" key={item._id}>
              <h3>Dr. {item.doctorName}</h3>
              <span>Issued: {new Date(item.issuedDate).toLocaleString()}</span>
              <span>Appointment ID: {item.appointmentId || "N/A"}</span>
              <span>Notes: {item.notes || "No notes"}</span>
              <div>
                <strong>Medicines:</strong>
                <ul>
                  {item.medicines.map((medicine, index) => (
                    <li key={`${medicine.name}-${index}`}>
                      {medicine.name} | {medicine.dosage || "No dosage"} | {medicine.instructions || "No instructions"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PatientPrescriptions;
