const mongoose = require("mongoose");

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    doctorId: {
      type: String,
      required: true,
      index: true
    },
    patientId: {
      type: String,
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ["JITSI"],
      default: "JITSI"
    },
    roomName: {
      type: String,
      required: true
    },
    meetingLink: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelemedicineSession", telemedicineSessionSchema);
