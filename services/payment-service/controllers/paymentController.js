const Payment = require("../models/Payment");

const getAppointmentServiceUrl = () =>
  (process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5003").replace(/\/+$/, "");

const verifyMyAppointment = async (appointmentId, authHeader) => {
  const response = await fetch(`${getAppointmentServiceUrl()}/appointments/my/${appointmentId}`, {
    headers: {
      Authorization: authHeader
    }
  });

  if (!response.ok) {
    return { valid: false, message: "Appointment not found for this patient" };
  }

  const appointment = await response.json();
  if (!["ACCEPTED", "COMPLETED"].includes(appointment.status)) {
    return { valid: false, message: "Payment is allowed only for accepted/completed appointments" };
  }

  return { valid: true, appointment };
};

const payForAppointment = async (req, res) => {
  try {
    const { appointmentId, amount, method = "MOCK_CARD", simulateFailure = false } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    const verification = await verifyMyAppointment(appointmentId, req.headers.authorization || "");
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const payAmount = Number(amount ?? verification.appointment.consultationFee ?? 0);

    let payment = await Payment.findOne({ appointmentId, patientId: req.user.id });
    const status = simulateFailure ? "FAILED" : "PAID";
    const transactionRef = `TXN-${Date.now()}`;

    if (!payment) {
      payment = await Payment.create({
        appointmentId,
        patientId: req.user.id,
        amount: payAmount,
        method,
        status,
        transactionRef
      });
    } else {
      payment.amount = payAmount;
      payment.method = method;
      payment.status = status;
      payment.transactionRef = transactionRef;
      await payment.save();
    }

    return res.status(200).json({
      message: status === "PAID" ? "Payment completed successfully" : "Payment failed",
      payment
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while processing payment" });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching payments" });
  }
};

const getPaymentByAppointment = async (req, res) => {
  try {
    const query = { appointmentId: req.params.appointmentId };

    if (req.user.role === "PATIENT") {
      query.patientId = req.user.id;
    }

    const payment = await Payment.findOne(query);

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching payment" });
  }
};

module.exports = {
  payForAppointment,
  getMyPayments,
  getPaymentByAppointment
};
