const express = require('express');

const router = express.Router();

const {register,login} = require("../controllers/authcontrollers");
const {
  sendOtp,
  verifyOtp,
  resetEmployeePassword,
} = require("../controllers/passwordResetControllers");

router.post("/register",register);
router.post("/login",login);

// Employee forgot/reset password (OTP flow).
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetEmployeePassword);

// Backward-compatible aliases
router.post("/employee/send-otp", sendOtp);
router.post("/employee/verify-otp", verifyOtp);
router.post("/employee/reset-password", resetEmployeePassword);

module.exports = router;