const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// OTP generation & dispatch
router.post('/send-otp', authController.sendOtp);

// OTP verification & session issuance
router.post('/verify-otp', authController.verifyOtp);

// Current user profile
router.get('/me', authController.getMe);

// Logout & session invalidation
router.post('/logout', authController.logout);

module.exports = router;
