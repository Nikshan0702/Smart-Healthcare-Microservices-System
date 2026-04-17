const crypto = require("crypto");
const TelemedicineSession = require("../models/TelemedicineSession");

const normalizeId = (value) => (value ?? "").toString().trim();
const isMongoObjectId = (value = "") => /^[a-f\d]{24}$/i.test(normalizeId(value));

const stripTrailingSlash = (url) => url.toString().replace(/\/+$/, "");
const getJitsiBaseUrl = () => stripTrailingSlash(process.env.JITSI_BASE_URL || "https://meet.jit.si");

const buildRoomName = (appointmentId) => `smart-health-${appointmentId}-${crypto.randomUUID()}`;
const buildMeetingLink = (roomName) => `${getJitsiBaseUrl()}/${roomName}`;

const actorAllowed = ({ user, doctorId, patientId }) => {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "DOCTOR") return user.id === doctorId;
  if (user.role === "PATIENT") return user.id === patientId;
  return false;
};

const createSession = async (req, res) => {
  try {
    const appointmentId = normalizeId(req.body?.appointmentId);
    const doctorId = normalizeId(req.body?.doctorId);
    const patientId = normalizeId(req.body?.patientId);

    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({ message: "appointmentId, doctorId and patientId are required" });
    }

    if (!isMongoObjectId(appointmentId)) {
      return res.status(400).json({ message: "appointmentId must be a valid id" });
    }

    if (!isMongoObjectId(doctorId)) {
      return res.status(400).json({ message: "doctorId must be a valid id" });
    }

    if (!isMongoObjectId(patientId)) {
      return res.status(400).json({ message: "patientId must be a valid id" });
    }

    if (!actorAllowed({ user: req.user, doctorId, patientId })) {
      return res.status(403).json({ message: "Access denied" });
    }

    const existingSession = await TelemedicineSession.findOne({ appointmentId });
    if (existingSession) {
      return res.status(200).json(existingSession);
    }

    const roomName = buildRoomName(appointmentId);
    const meetingLink = buildMeetingLink(roomName);

    const session = await TelemedicineSession.create({
      appointmentId,
      doctorId,
      patientId,
      roomName,
      meetingLink,
      provider: "JITSI"
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error("Failed to create telemedicine session:", error.message);
    return res.status(500).json({ message: "Server error while creating telemedicine session" });
  }
};

const getSessionByAppointmentId = async (req, res) => {
  try {
    const appointmentId = normalizeId(req.params?.appointmentId);
    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    if (!isMongoObjectId(appointmentId)) {
      return res.status(400).json({ message: "appointmentId must be a valid id" });
    }

    const session = await TelemedicineSession.findOne({ appointmentId });
    if (!session) {
      return res.status(404).json({ message: "Telemedicine session not found" });
    }

    if (!actorAllowed({ user: req.user, doctorId: session.doctorId, patientId: session.patientId })) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error("Failed to fetch telemedicine session:", error.message);
    return res.status(500).json({ message: "Server error while fetching telemedicine session" });
  }
};

module.exports = { createSession, getSessionByAppointmentId };
