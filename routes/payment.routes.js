const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Payment routes
router.post('/', verifyToken, paymentController.createPaymentIntent);
router.post('/transfer-payment', paymentController.transferPayment);
router.get('/refund/:bookingId', paymentController.refundPayment);
router.get('/card-details', verifyToken, paymentController.getCardDetails);
router.post('/connect-stripe', paymentController.createStripeAccount);
router.get('/get-account/:accountId', paymentController.getStripeAccount);

// NEW: Webhook endpoint for Stripe
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handlePaymentSuccess);

// NEW: Admin routes for transactions
router.get('/transactions', verifyToken, isAdmin, paymentController.getAllTransactions);
router.put('/transactions/:transactionId', verifyToken, isAdmin, paymentController.updateTransactionStatus);

module.exports = router;