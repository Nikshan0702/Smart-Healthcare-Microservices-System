const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));

const proxyTimeoutMs = Number(process.env.GATEWAY_PROXY_TIMEOUT_MS || 30000);

const stripTrailingSlash = (url) => url.replace(/\/+$/, "");
const authTarget = `${stripTrailingSlash(process.env.AUTH_SERVICE_URL || "http://auth-service:5001")}/auth`;
const doctorTarget = `${stripTrailingSlash(process.env.DOCTOR_SERVICE_URL || "http://doctor-service:5002")}/doctors`;
const appointmentTarget = `${stripTrailingSlash(process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5003")}/appointments`;
const telemedicineTarget = `${stripTrailingSlash(process.env.TELEMEDICINE_SERVICE_URL || "http://telemedicine-service:5007")}/telemedicine`;
const patientTarget = `${stripTrailingSlash(process.env.PATIENT_SERVICE_URL || "http://patient-service:5004")}/patients`;
const paymentTarget = `${stripTrailingSlash(process.env.PAYMENT_SERVICE_URL || "http://payment-service:5005")}/payments`;
const notificationTarget = `${stripTrailingSlash(process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5006")}/notifications`;

app.get("/", (req, res) => {
  res.status(200).json({
    service: "api-gateway",
    status: "running",
    routes: {
      auth: "/auth",
      doctors: "/doctors",
      appointments: "/appointments",
      telemedicine: "/telemedicine",
      patients: "/patients",
      payments: "/payments",
      notifications: "/notifications"
    }
  });
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: authTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Auth service is unavailable",
        error: err.message
      });
    }
  })
);

app.use(
  "/doctors",
  createProxyMiddleware({
    target: doctorTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Doctor service is unavailable",
        error: err.message
      });
    }
  })
);

app.use(
  "/appointments",
  createProxyMiddleware({
    target: appointmentTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Appointment service is unavailable",
        error: err.message
      });
    }
  })
);

app.use(
  "/telemedicine",
  createProxyMiddleware({
    target: telemedicineTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Telemedicine service is unavailable",
        error: err.message
      });
    }
  })
);

app.use(
  "/patients",
  createProxyMiddleware({
    target: patientTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Patient service is unavailable",
        error: err.message
      });
    }
  })
);

app.use(
  "/payments",
  createProxyMiddleware({
    target: paymentTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Payment service is unavailable",
        error: err.message
      });
    }
  })
);

app.use(
  "/notifications",
  createProxyMiddleware({
    target: notificationTarget,
    changeOrigin: true,
    proxyTimeout: proxyTimeoutMs,
    timeout: proxyTimeoutMs,
    onError: (err, req, res) => {
      res.status(502).json({
        message: "Notification service is unavailable",
        error: err.message
      });
    }
  })
);

app.use((req, res) => {
  res.status(404).json({ message: "Gateway route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
