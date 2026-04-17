const express = require("express");
const { createSession, getSessionByAppointmentId } = require("../controllers/telemedicineController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/sessions", authenticate, authorize("DOCTOR", "ADMIN"), createSession);
router.get("/sessions/:appointmentId", authenticate, authorize("DOCTOR", "ADMIN"), getSessionByAppointmentId);

module.exports = router;
