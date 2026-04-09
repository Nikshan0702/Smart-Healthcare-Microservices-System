const express = require("express");
const { payForAppointment, getMyPayments, getPaymentByAppointment } = require("../controllers/paymentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/pay", authenticate, authorize("PATIENT"), payForAppointment);
router.get("/my", authenticate, authorize("PATIENT"), getMyPayments);
router.get("/appointment/:appointmentId", authenticate, authorize("PATIENT", "DOCTOR", "ADMIN"), getPaymentByAppointment);

module.exports = router;
