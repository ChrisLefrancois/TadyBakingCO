// server/utils/sendEmail.js
const nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn("⚠️ Missing Gmail env vars. Emails will fail.");
}

// Create transporter once
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,   // IMPORTANT: must be false on Render
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,  // App password ONLY
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP Ready");
  }
});

/**
 * Send an email (supports attachments)
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {Array}  [options.attachments] - Optional attachments
 */
async function sendEmail({ to, subject, html, attachments = [] }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("❌ Missing Gmail credentials. Email not sent.");
    return;
  }

  const mailOptions = {
    from: `"Tady Baking Co" <${GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // ✔ Only attach files if provided
  if (attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}

module.exports = sendEmail;
