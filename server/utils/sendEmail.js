// server/utils/sendEmail.js

const Mailjet = require("node-mailjet");
const fs = require("fs");

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    const message = {
      From: {
        Email: process.env.EMAIL_FROM, // ex: orders@tadybakingco.ca
        Name: "Tady Baking Co",
      },
      To: [
        {
          Email: to,
        },
      ],
      Subject: subject,
      HTMLPart: html,
    };

    // Handle attachments
    if (attachments.length > 0) {
      message.Attachments = attachments.map((file) => {
        const fileContent = fs.readFileSync(file.path).toString("base64");
        return {
          ContentType: file.contentType || "application/pdf",
          Filename: file.filename,
          Base64Content: fileContent,
        };
      });
    }

    const result = await mailjet
      .post("send", { version: "v3.1" })
      .request({ Messages: [message] });

    console.log("📨 Mailjet API sent:", result.body);

  } catch (err) {
    console.error("❌ Mailjet API failed:", err);
  }
}

module.exports = sendEmail;
