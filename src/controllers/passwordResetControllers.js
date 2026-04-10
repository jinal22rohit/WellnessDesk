const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/usermodel");
const Employee = require("../models/employee_model");
const { sendOtpEmail } = require("../config/email");

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function genOtp6() {
  // crypto-safe 6-digit code (100000-999999)
  const n = crypto.randomInt(100000, 1000000);
  return String(n).padStart(6, "0");
}

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function normalizePhone(phone) {
  return String(phone || "").trim();
}

async function findUserByIdentifier({ email, phoneNumber }) {
  if (email) {
    return User.findOne({ email: normalizeEmail(email) });
  }

  if (phoneNumber) {
    return User.findOne({ phoneNumber: normalizePhone(phoneNumber) });
  }

  // Legacy fallback for employee records if old rows weren't synced yet.
  if (email) {
    const emp = await Employee.findOne({ email: normalizeEmail(email) });
    if (emp) return User.findOne({ employeeId: emp._id });
  }
  return null;
}

// POST /api/auth/send-otp
// Body: { email } or { phoneNumber }
async function sendOtp(req, res) {
  try {
    const { email, phoneNumber } = req.body || {};
    const hasEmail = typeof email === "string" && email.trim().length > 0;
    const hasPhone = typeof phoneNumber === "string" && phoneNumber.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      return res.status(400).json({ success: 0, message: "email or phoneNumber is required" });
    }

    const user = await findUserByIdentifier({
      email: hasEmail ? email : null,
      phoneNumber: hasPhone ? phoneNumber : null,
    });
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found for this identifier" });
    }

    const otp = genOtp6();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    // Send OTP (console log for debugging + email for user)
    const channel = hasEmail ? "email" : "sms";
    console.log(`OTP via ${channel}:`, { identifier: hasEmail ? normalizeEmail(email) : normalizePhone(phoneNumber), otp });

    // Send email if email is provided
    if (hasEmail) {
      try {
        const emailSent = await sendOtpEmail(normalizeEmail(email), otp);
        if (emailSent) {
          console.log(`OTP email sent to: ${normalizeEmail(email)}`);
        } else {
          console.log(`Failed to send OTP email to: ${normalizeEmail(email)}`);
        }
      } catch (emailError) {
        console.error('Error sending OTP email:', emailError);
        // Continue with response even if email fails (OTP is still valid)
      }
    }

    return res.json({
      success: 1,
      message: "OTP sent (check server logs).",
      otpExpiry: user.otpExpiry,
    });
  } catch (err) {
    return res.status(500).json({ success: 0, message: "Send OTP failed", err: err.message });
  }
}

// POST /api/auth/verify-otp
// Body: { email, otp } or { phoneNumber, otp }
async function verifyOtp(req, res) {
  try {
    const { email, phoneNumber, otp } = req.body || {};
    if (!otp || typeof otp !== "string") {
      return res.status(400).json({ success: 0, message: "otp is required" });
    }

    const user = await findUserByIdentifier({ email, phoneNumber });
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: 0, message: "OTP expired. Please request a new OTP." });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: 0, message: "Invalid OTP" });
    }

    return res.json({ success: 1, message: "OTP verified." });
  } catch (err) {
    return res.status(500).json({ success: 0, message: "OTP verification failed", err: err.message });
  }
}

// POST /api/auth/reset-password
// Body: { email, otp, newPassword } OR { phoneNumber, otp, newPassword }
async function resetEmployeePassword(req, res) {
  try {
    const { email, phoneNumber, otp, newPassword } = req.body || {};

    const hasEmail = typeof email === "string" && email.trim().length > 0;
    const hasPhone = typeof phoneNumber === "string" && phoneNumber.trim().length > 0;
    if (!hasEmail && !hasPhone) {
      return res.status(400).json({ success: 0, message: "email or phoneNumber is required" });
    }
    if (!otp || typeof otp !== "string") {
      return res.status(400).json({ success: 0, message: "otp is required" });
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ success: 0, message: "newPassword must be at least 8 characters" });
    }

    const user = await findUserByIdentifier({
      email: hasEmail ? email : null,
      phoneNumber: hasPhone ? phoneNumber : null,
    });
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: 0, message: "OTP expired. Please request a new OTP." });
    }
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: 0, message: "Invalid OTP" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.json({ success: 1, message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ success: 0, message: "Reset password failed", err: err.message });
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
  resetEmployeePassword,
};

