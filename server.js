

const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;
    const text = message.text;

    // Extract email from message text
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;
    const match = text.match(emailRegex);
    const userEmail = match ? match[0] : null;

    if (!userEmail) {
      console.log("No email found in message:", text);
      return res.sendStatus(200);
    }

    // Compose and send email
    await transporter.sendMail({
      from: `"DecryptLabsX" <${SMTP_USER}>`,
      to: userEmail,
      subject: "🚀 Your Free Crypto Audit Request",
      text: `Hey! Thanks for contacting DecryptLabsX.\n\nWe’ve received your request and will review it shortly.\nIn the meantime, you can reach us at contact@decryptlabsx.com.`,
    });

    console.log("✅ Auto-reply sent to:", userEmail);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error processing Telegram webhook:", err.message);
    res.sendStatus(500);
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('❗ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❗ Unhandled Rejection:', reason);
});