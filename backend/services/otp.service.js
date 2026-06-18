// ============================================================
// OTP SERVICE — Generate, Store, Verify, and Send OTP via Email
// ============================================================

const nodemailer = require('nodemailer');

// In-memory OTP store: { email: { otp, expiresAt } }
// For production, use Redis or a DB table
const otpStore = {};

// OTP config
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ============================================================
// Generate a 6-digit OTP
// ============================================================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================
// Save OTP to in-memory store
// ============================================================
function saveOTP(email, otp) {
  otpStore[email.toLowerCase()] = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS
  };
}

// ============================================================
// Verify OTP — returns true/false
// ============================================================
function verifyOTP(email, otp) {
  const record = otpStore[email.toLowerCase()];
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    delete otpStore[email.toLowerCase()];
    return false;
  }
  if (record.otp !== otp) return false;
  delete otpStore[email.toLowerCase()]; // OTP is one-time use
  return true;
}

// ============================================================
// Create Nodemailer Transporter
// Uses Gmail SMTP — set EMAIL_USER and EMAIL_PASS in .env
// ============================================================
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Gmail App Password (not your real password)
    }
  });
}

// ============================================================
// Send OTP Email
// ============================================================
async function sendOTPEmail(email, otp, name = 'User') {
  // If EMAIL_USER is not configured, log OTP to console (dev fallback)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [DEV MODE] OTP for ${email}: ${otp}\n`);
    return true;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Shaadi Bazaar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Shaadi Bazaar Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #1a0a0a; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #2a1010; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #d4af37, #b8860b); padding: 30px; text-align: center; }
          .header h1 { color: #1a0a0a; margin: 0; font-size: 24px; }
          .body { padding: 30px; }
          .otp-box { background: rgba(212,175,55,0.1); border: 2px solid #d4af37; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 40px; font-weight: 900; color: #d4af37; letter-spacing: 10px; }
          .text { color: #ccc; line-height: 1.6; }
          .footer { color: #888; font-size: 12px; text-align: center; padding: 20px; border-top: 1px solid #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💍 Shaadi Bazaar</h1>
          </div>
          <div class="body">
            <p class="text">Hello <strong>${name}</strong>,</p>
            <p class="text">Your email verification code for Shaadi Bazaar is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="text">This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <p class="text">If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; 2024 Shaadi Bazaar — Pakistan's Premier Wedding Marketplace
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  return true;
}

module.exports = { generateOTP, saveOTP, verifyOTP, sendOTPEmail };
