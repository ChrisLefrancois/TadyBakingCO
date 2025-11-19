// server/utils/sendEmail.js
const nodemailer = require("nodemailer");

const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Tady Baking Co <no-reply@example.com>";

if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
  console.warn("⚠️ Missing Mailjet env vars. Emails will fail.");
}

// Create transporter with Mailjet SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.mailjet.com",
  port: 587,
  secure: false,
  auth: {
    user: MAILJET_API_KEY,
    pass: MAILJET_SECRET_KEY,
  },
});

// Debug SMTP status on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP Ready (Mailjet)");
  }
});

/**
 * Send email (supports attachments)
 */
async function sendEmail({ to, subject, html, attachments = [] }) {
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}

module.exports = sendEmail;
