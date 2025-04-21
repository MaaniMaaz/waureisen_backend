const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { isProvider } = require('../middlewares/role');
const providerController = require('../controllers/provider.controller');
const providerProfileController = require('../controllers/provider.profile.controller');

// Auth routes (no authentication required)
router.post('/signup', providerController.signup);
router.post('/login', providerController.login);

// Profile routes
router.get('/profile', verifyToken, isProvider, providerProfileController.getProviderProfile);
router.put('/profile', verifyToken, isProvider, providerProfileController.updateProviderProfile);

// Listings Management
router.get('/listings', verifyToken, isProvider, providerProfileController.getProviderListings);
router.get('/listings/:id', verifyToken, isProvider, providerController.getListingDetails);
router.post('/add-listing', verifyToken, isProvider, providerController.addListing);
router.put('/listings/:id', verifyToken, isProvider, providerController.updateListing);
router.delete('/listings/:id', verifyToken, isProvider, providerController.deleteProviderListing);

// Bookings Management
router.get('/bookings', verifyToken, isProvider, providerProfileController.getProviderBookings);
router.get('/bookings/:id', verifyToken, isProvider, providerController.getBookingDetails);
router.put('/bookings/:id/accept', verifyToken, isProvider, providerProfileController.acceptBooking);
router.put('/bookings/:id/reject', verifyToken, isProvider, providerProfileController.rejectBooking);

// Calendar Management
router.get('/calendar/unavailable-dates', verifyToken, isProvider, providerProfileController.getUnavailableDates);
router.post('/calendar/block-dates', verifyToken, isProvider, providerProfileController.blockDates);
router.delete('/calendar/unblock-dates', verifyToken, isProvider, providerProfileController.unblockDates);

// Analytics & Dashboard
router.get('/analytics', verifyToken, isProvider, providerProfileController.getProviderAnalytics);
//router.get('/dashboard/stats', verifyToken, isProvider, providerProfileController.getProviderDashboardStats);
router.get('/earnings', verifyToken, isProvider, providerProfileController.getProviderEarnings);
router.get('/transactions', verifyToken, isProvider, providerProfileController.getProviderTransactions);

// Provider messages/chat
router.get('/messages', verifyToken, isProvider, providerProfileController.getProviderMessages);
router.get('/messages/:userId', verifyToken, isProvider, providerProfileController.getMessageThread);
router.post('/messages/send', verifyToken, isProvider, providerProfileController.sendMessage);

// Public routes (for user access to provider info)
router.get('/public/:id', providerController.getPublicProviderProfile);
router.get('/public/:id/listings', providerController.getPublicProviderListings);

module.exports = router;