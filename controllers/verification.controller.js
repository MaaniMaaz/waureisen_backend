const emailService = require('../services/email.service');

// Send verification code to email
exports.sendVerificationCode = async (req, res, next) => {
  try {
    const { email, userType } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!userType || !['user', 'provider'].includes(userType)) {
      return res.status(400).json({ message: 'Valid user type is required' });
    }

    await emailService.createVerificationCode(email, userType);
    
    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent successfully' 
    });
  } catch (err) {
    console.error('Error sending verification code:', err);
    next(err);
  }
};

// Verify the code
exports.verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const result = emailService.verifyCode(email, code);
    
    if (!result.verified) {
      return res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      userType: result.userType
    });
  } catch (err) {
    console.error('Error verifying code:', err);
    next(err);
  }
};