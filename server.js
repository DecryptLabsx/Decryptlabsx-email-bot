const axios = require("axios");
const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10);

let lastUpdateId = 0;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

async function checkTelegramUpdates() {
  try {
    const res = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`
    );
    const updates = res.data.result;
    for (const update of updates) {
      lastUpdateId = update.update_id;
      const message = update.message?.text || "";
      const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const nameMatch = message.match(/Name: (.*)/i);
      const issueMatch = message.match(/Problem: (.*)/i);

      if (emailMatch) {
        const userEmail = emailMatch[0];
        const userName = nameMatch ? nameMatch[1].trim() : "there";
        const issue = issueMatch ? issueMatch[1].trim() : "your request";

        await transporter.sendMail({
          from: SMTP_USER,
          to: userEmail,
          subject: "Your Free Audit Request – DecryptLabsX",
          text: `Hi ${userName},\n\nThank you for reaching out to DecryptLabsX regarding ${issue}. Our team has received your request and will get back to you shortly.\n\nIf you have any questions, feel free to reply to this email.\n\n– DecryptLabsX Team`
        });
        console.log("✅ Auto-reply sent to:", userEmail);
      }
    }
  } catch (error) {
    console.error("Error checking Telegram messages:", error.message);
  }
}

setInterval(checkTelegramUpdates, 8000); // Check every 8 seconds

app.get("/", (req, res) => {
  res.send("🔁 DecryptLabsX Email Auto-Responder is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});