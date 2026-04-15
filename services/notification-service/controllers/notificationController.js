const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
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

    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "smart-healthcare@example.com",
      to,
      subject,
      text: message
    });

    return res.status(200).json({
      message: "Notification sent",
      resultId: result.messageId || "mock-message"
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while sending notification" });
  }
};

module.exports = {
  sendEmail
};
