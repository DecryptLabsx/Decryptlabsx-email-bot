const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Heartbeat
app.get('/', (req, res) => {
  res.send('🔄 Server is alive');
});

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ✅ New: Use getUpdates instead of polling
let lastUpdateId = 0;




async function checkTelegramUpdates() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
    const updates = response.data.result;

    for (const update of updates) {
      lastUpdateId = update.update_id;

      const msg = update.message.text;
      const emailMatch = msg.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        const toEmail = emailMatch[0];

        await transporter.sendMail({
          from: `"DecryptLabsX" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: "We Received Your Audit Request",
          text: `Hello,\n\nThanks for reaching out to DecryptLabsX. Your audit request has been received.\n\nWe'll get back to you shortly.\n\n- DecryptLabsX`
        });

        console.log(`✅ Email sent to: ${toEmail}`);
      } else {
        console.log("⚠️ No valid email found in message.");
      }
    }
  } catch (err) {
    console.error("❌ Error checking Telegram updates:");
    console.error(err.response?.data || err.message); // 👈 Show full Telegram API error
  }
}

// Run the check every 10 seconds
setInterval(checkTelegramUpdates, 10000);

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});