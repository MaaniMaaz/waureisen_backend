const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Payment routes
router.post('/', verifyToken, paymentController.createPaymentIntent);
router.post('/transfer-payment',  paymentController.transferPayment);
router.get('/refund/:bookingId',  paymentController.refundPayment);
router.get('/card-details',verifyToken,  paymentController.getCardDetails);
router.post('/connect-stripe',  paymentController.createStripeAccount);
router.get('/get-account/:id',  paymentController.getStripeAccount);

module.exports = router;