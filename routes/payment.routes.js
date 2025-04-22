const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Payment routes
router.post('/',verifyToken,  paymentController.createPaymentIntent);

module.exports = router;