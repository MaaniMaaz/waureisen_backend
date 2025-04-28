const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

// Send verification code to email
router.post('/send-code', verificationController.sendVerificationCode);

// Verify the code
router.post('/verify-code', verificationController.verifyCode);

module.exports = router;