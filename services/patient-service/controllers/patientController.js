const path = require("path");
const fs = require("fs");
const PatientProfile = require("../models/PatientProfile");
const Report = require("../models/Report");
const Prescription = require("../models/Prescription");

const normalizeString = (value = "") => value.toString().trim();
const normalizeName = (value = "") => normalizeString(value).replace(/\s+/g, " ");
const isMongoObjectId = (value = "") => /^[a-f\d]{24}$/i.test(normalizeString(value));
const isValidName = (value = "") => {
  const name = normalizeName(value);
  return name.length >= 2 && name.length <= 80;
};

const isValidDateKey = (value = "") => {
  const dateKey = normalizeString(value);
  if (!dateKey) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
};

const isValidPhone = (value = "") => {
  const phone = normalizeString(value);
  if (!phone) return true;
  if (phone.length < 7 || phone.length > 20) return false;
  return /^[+\d][\d\s()-]*$/.test(phone);
};

const getAppointmentServiceUrl = () =>
  (process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5003").replace(/\/+$/, "");
const getNotificationServiceUrl = () =>
  (process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5006").replace(/\/+$/, "");

const notifyByEmail = async ({ to, subject, message }) => {
  if (!to) return;

  try {
    const response = await fetch(`${getNotificationServiceUrl()}/notifications/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Notification service returned an error:", {
        status: response.status,
        body
      });
    }
  } catch (error) {
    console.error("Notification send failed:", error.message);
  }
};

const getOrCreateMyProfile = async (user) => {
  let profile = await PatientProfile.findOne({ userId: user.id });

  if (!profile) {
    profile = await PatientProfile.create({
      userId: user.id,
      name: user.name,
      email: user.email
    });
  }

  return profile;
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await getOrCreateMyProfile(req.user);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching patient profile" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const profile = await getOrCreateMyProfile(req.user);

    const allowedFields = ["name", "phone", "dateOfBirth", "gender", "address", "medicalHistory"];

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string") {
        return res.status(400).json({ message: "name must be a string" });
      }
      if (!isValidName(req.body.name)) {
        return res.status(400).json({ message: "name must be between 2 and 80 characters" });
      }
    }

    if (req.body.phone !== undefined) {
      if (typeof req.body.phone !== "string") {
        return res.status(400).json({ message: "phone must be a string" });
      }
      if (!isValidPhone(req.body.phone)) {
        return res.status(400).json({ message: "phone must be a valid phone number" });
      }
    }

    if (req.body.dateOfBirth !== undefined) {
      if (typeof req.body.dateOfBirth !== "string") {
        return res.status(400).json({ message: "dateOfBirth must be a string" });
      }
      if (!isValidDateKey(req.body.dateOfBirth)) {
        return res.status(400).json({ message: "dateOfBirth must be a valid date (YYYY-MM-DD)" });
      }
    }

    if (req.body.gender !== undefined) {
      if (typeof req.body.gender !== "string") {
        return res.status(400).json({ message: "gender must be a string" });
      }

      const gender = normalizeString(req.body.gender);
      const allowed = new Set(["", "Male", "Female", "Other"]);
      if (!allowed.has(gender)) {
        return res.status(400).json({ message: "gender must be one of: Male, Female, Other" });
      }
    }

    if (req.body.address !== undefined) {
      if (typeof req.body.address !== "string") {
        return res.status(400).json({ message: "address must be a string" });
      }
      if (normalizeString(req.body.address).length > 200) {
        return res.status(400).json({ message: "address must be 200 characters or less" });
      }
    }

    if (req.body.medicalHistory !== undefined) {
      if (typeof req.body.medicalHistory !== "string") {
        return res.status(400).json({ message: "medicalHistory must be a string" });
      }
      if (normalizeString(req.body.medicalHistory).length > 2000) {
        return res.status(400).json({ message: "medicalHistory must be 2000 characters or less" });
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "name") {
          profile[field] = normalizeName(req.body[field]);
        } else {
          profile[field] = normalizeString(req.body[field]);
        }
      }
    });

    await profile.save();

    return res.status(200).json({
      message: "Patient profile updated successfully",
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating profile" });
  }
};

const uploadMyReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const profile = await getOrCreateMyProfile(req.user);

    const titleInput = req.body?.title;
    if (titleInput !== undefined && typeof titleInput !== "string") {
      return res.status(400).json({ message: "title must be a string" });
    }

    const descriptionInput = req.body?.description;
    if (descriptionInput !== undefined && typeof descriptionInput !== "string") {
      return res.status(400).json({ message: "description must be a string" });
    }

    const title = normalizeString(titleInput || "Medical Report");
    if (title.length < 2 || title.length > 80) {
      return res.status(400).json({ message: "title must be between 2 and 80 characters" });
    }

    const description = normalizeString(descriptionInput || "");
    if (description.length > 500) {
      return res.status(400).json({ message: "description must be 500 characters or less" });
    }

    const report = await Report.create({
      patientId: req.user.id,
      patientName: profile.name,
      title,
      description,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    });

    return res.status(201).json({
      message: "Report uploaded successfully",
      report
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while uploading report" });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching reports" });
  }
};

const getReportsByPatientId = async (req, res) => {
  try {
    if (!isMongoObjectId(req.params.patientId)) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    const reports = await Report.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching reports" });
  }
};

const downloadReport = async (req, res) => {
  try {
    if (!isMongoObjectId(req.params.reportId)) {
      return res.status(400).json({ message: "Invalid reportId" });
    }

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (req.user.role === "PATIENT" && report.patientId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const resolvedPath = path.resolve(report.filePath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "Report file not found on server" });
    }

    return res.download(resolvedPath, report.originalName);
  } catch (error) {
    return res.status(500).json({ message: "Server error while downloading report" });
  }
};

const validateAppointmentForDoctor = async (appointmentId, authHeader) => {
  const response = await fetch(`${getAppointmentServiceUrl()}/appointments/doctor/${appointmentId}`, {
    headers: {
      Authorization: authHeader
    }
  });

  if (!response.ok) {
    return { valid: false, message: "Appointment not found for this doctor" };
  }

  const appointment = await response.json();
  if (!["ACCEPTED", "COMPLETED"].includes(appointment.status)) {
    return { valid: false, message: "Prescription can only be issued for accepted/completed appointments" };
  }

  return { valid: true };
};

const issuePrescription = async (req, res) => {
  try {
    const { patientId, appointmentId = "", medicines = [], notes = "" } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    if (!isMongoObjectId(patientId)) {
      return res.status(400).json({ message: "patientId must be a valid id" });
    }

    if (appointmentId && !isMongoObjectId(appointmentId)) {
      return res.status(400).json({ message: "appointmentId must be a valid id" });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "medicines must be a non-empty array" });
    }

    if (medicines.length > 30) {
      return res.status(400).json({ message: "medicines must contain 30 items or less" });
    }

    if (typeof notes !== "string") {
      return res.status(400).json({ message: "notes must be a string" });
    }

    if (normalizeString(notes).length > 2000) {
      return res.status(400).json({ message: "notes must be 2000 characters or less" });
    }

    const patientProfile = await PatientProfile.findOne({ userId: patientId });
    if (!patientProfile) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    if (appointmentId) {
      const appointmentCheck = await validateAppointmentForDoctor(appointmentId, req.headers.authorization || "");
      if (!appointmentCheck.valid) {
        return res.status(400).json({ message: appointmentCheck.message });
      }
    }

    const normalizedMedicines = medicines
      .map((item) => ({
        name: typeof item?.name === "string" ? normalizeString(item.name) : "",
        dosage: typeof item?.dosage === "string" ? normalizeString(item.dosage) : "",
        instructions: typeof item?.instructions === "string" ? normalizeString(item.instructions) : ""
      }))
      .filter((item) => item.name);

    if (normalizedMedicines.length === 0) {
      return res.status(400).json({ message: "Each medicine must include a name" });
    }

    const hasOversizedMedicine = normalizedMedicines.some((item) => item.name.length > 80 || item.dosage.length > 120 || item.instructions.length > 240);
    if (hasOversizedMedicine) {
      return res.status(400).json({ message: "medicine fields are too long" });
    }

    const prescription = await Prescription.create({
      patientId,
      patientName: patientProfile.name,
      doctorId: req.user.id,
      doctorName: req.user.name,
      appointmentId,
      medicines: normalizedMedicines,
      notes: normalizeString(notes),
      issuedDate: new Date()
    });

    await notifyByEmail({
      to: patientProfile.email,
      subject: "New prescription issued",
      message: `Dr. ${req.user.name} issued a prescription for your consultation.`
    });

    return res.status(201).json({
      message: "Prescription issued successfully",
      prescription
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while issuing prescription" });
  }
};

const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user.id }).sort({ issuedDate: -1, createdAt: -1 });
    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching prescriptions" });
  }
};

const getDoctorPrescriptions = async (req, res) => {
  try {
    const filter = { doctorId: req.user.id };
    if (req.query.patientId) {
      if (!isMongoObjectId(req.query.patientId)) {
        return res.status(400).json({ message: "patientId must be a valid id" });
      }
      filter.patientId = req.query.patientId;
    }

    const prescriptions = await Prescription.find(filter).sort({ issuedDate: -1, createdAt: -1 });
    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching prescriptions" });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadMyReport,
  getMyReports,
  getReportsByPatientId,
  downloadReport,
  issuePrescription,
  getMyPrescriptions,
  getDoctorPrescriptions
};
