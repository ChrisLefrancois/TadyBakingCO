// server/utils/sendEmail.js
const nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn(
    "⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is missing. Emails will fail to send."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD, // this must be a Gmail APP PASSWORD, not your normal password
  },
});

async function sendEmail({ to, subject, html }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("❌ Cannot send email: missing Gmail credentials env vars.");
    return;
  }

  const mailOptions = {
    from: `"Tady Baking Co" <${GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
}

module.exports = sendEmail;
