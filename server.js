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

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 💌 Styled email template with logo
function getStyledEmailHTML() {
  return `
  <html>
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
        <div style="background-color:#0f172a; color:#ffffff; padding:20px 30px; text-align:center;">
          <img src="https://decryptlabsx.com/logo.png" alt="DecryptLabsX Logo" style="max-height:60px; margin-bottom:10px;">
          <h2 style="margin:0;">DecryptLabsX</h2>
          <p style="margin:0; font-size:14px;">Crypto & Stock Recovery Experts</p>
        </div>

        <div style="padding:30px;">
          <h3 style="color:#0f172a; margin-top:0;">We Received Your Assessment Request</h3>
          <p style="font-size:15px; color:#333333;">Thanks for contacting DecryptLabsX. Your request has been received and is currently being reviewed by our recovery specialists.</p>
          <p style="font-size:15px; color:#333333;">You’ll hear back from us shortly via email. If you believe this message was sent in error, you can ignore it.</p>

          <div style="margin:30px 0;">
            <a href="https://decryptlabsx.com" style="display:inline-block; padding:12px 20px; background-color:#0f172a; color:#ffffff; text-decoration:none; border-radius:4px; font-weight:bold;">Visit Our Website</a>
          </div>

          <p style="font-size:13px; color:#777;">We appreciate your trust in our crypto & stock recovery services.</p>
        </div>

        <div style="background:#f0f0f0; padding:20px 30px; text-align:center; font-size:12px; color:#888888;">
          &copy; 2025 DecryptLabsX. All rights reserved.<br>
          <a href="https://decryptlabsx.com" style="color:#888;">www.decryptlabsx.com</a>
        </div>
      </div>
    </body>
  </html>
  `;
}

// 🧠 Keep track of last Telegram update
let lastUpdateId = 0;

async function checkTelegramUpdates() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
    const updates = response.data.result;

    for (const update of updates) {
      lastUpdateId = update.update_id;

      const msg = update.message?.text || '';
      const emailMatch = msg.match(/[\w.-]+@[\w.-]+\.\w+/);

      if (emailMatch) {
        const toEmail = emailMatch[0];

        await transporter.sendMail({
          from: `"DecryptLabsX" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: "We Received Your Assessment Request",
          html: getStyledEmailHTML() // ✅ Use styled HTML
        });

        console.log(`✅ Styled email sent to: ${toEmail}`);
      } else {
        console.log("⚠️ No valid email found in message.");
      }
    }
  } catch (err) {
    console.error("❌ Error checking Telegram updates:");
    console.error(err.response?.data || err.message);
  }
}

// 🔄 Check Telegram every 10 seconds
setInterval(checkTelegramUpdates, 10000);

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});