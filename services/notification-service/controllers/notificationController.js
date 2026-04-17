const nodemailer = require("nodemailer");

const normalizeEnvValue = (value = "") => value.toString().trim();
const normalizeString = (value = "") => value.toString().trim();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (value = "") => EMAIL_REGEX.test(normalizeString(value));
const isValidEmailList = (value = "") => {
  const raw = normalizeString(value);
  if (!raw) return false;

  const emails = raw.split(",").map((item) => normalizeString(item)).filter(Boolean);
  if (emails.length === 0) return false;

  return emails.every((email) => isValidEmail(email));
};

const normalizeSmtpPassword = (value = "") => {
  const raw = value.toString();

  // Google app passwords are often pasted with spaces for readability.
  if ((process.env.SMTP_HOST || "").toLowerCase().includes("gmail")) {
    return raw.replace(/\s+/g, "");
  }

  return raw.trim();
};

const createTransporter = () => {
  const host = normalizeEnvValue(process.env.SMTP_HOST);
  const user = normalizeEnvValue(process.env.SMTP_USER);
  const pass = normalizeSmtpPassword(process.env.SMTP_PASS);

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user,
        pass
      }
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: "to, subject and message are required" });
    }

    if (typeof to !== "string" || !isValidEmailList(to)) {
      return res.status(400).json({ message: "to must be a valid email address (or comma-separated list)" });
    }

    if (typeof subject !== "string") {
      return res.status(400).json({ message: "subject must be a string" });
    }

    const normalizedSubject = normalizeString(subject);
    if (normalizedSubject.length < 2 || normalizedSubject.length > 120) {
      return res.status(400).json({ message: "subject must be between 2 and 120 characters" });
    }

    if (typeof message !== "string") {
      return res.status(400).json({ message: "message must be a string" });
    }

    const normalizedMessage = normalizeString(message);
    if (normalizedMessage.length < 2 || normalizedMessage.length > 5000) {
      return res.status(400).json({ message: "message must be between 2 and 5000 characters" });
    }

    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from:
        normalizeEnvValue(process.env.EMAIL_FROM) ||
        normalizeEnvValue(process.env.SMTP_FROM) ||
        normalizeEnvValue(process.env.SMTP_USER) ||
        "smart-healthcare@example.com",
      to: normalizeString(to),
      subject: normalizedSubject,
      text: normalizedMessage
    });

    return res.status(200).json({
      message: "Notification sent",
      resultId: result.messageId || "mock-message"
    });
  } catch (error) {
    console.error("Notification send failed:", {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return res.status(500).json({ message: "Server error while sending notification" });
  }
};

module.exports = {
  sendEmail
};
