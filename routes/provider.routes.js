// routes/provider.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth'); 
const { isProvider } = require('../middlewares/role');

const providerController = require('../controllers/provider.controller');
const providerProfileController = require('../controllers/provider.profile.controller');

// Auth routes
router.post('/signup', providerController.signup);
router.post('/login', providerController.login);

// Public routes
router.get('/', providerController.getAllProviders);
router.get('/:id', providerController.getProviderById);

// Protected routes requiring authentication
router.post('/', providerController.createProvider);
router.put('/:id', verifyToken, providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

// Provider adds a new listing
router.post('/add-listing', verifyToken, isProvider, providerController.addListing);

// Provider profile routes
router.get('/profile', verifyToken, isProvider, providerProfileController.getProviderProfile);
router.put('/profile', verifyToken, isProvider, providerProfileController.updateProviderProfile);

// Provider listings management
router.get('/listings', verifyToken, isProvider, providerProfileController.getProviderListings);

// Provider bookings management
router.get('/bookings', verifyToken, isProvider, providerProfileController.getProviderBookings);
router.put('/bookings/:id/accept', verifyToken, isProvider, providerProfileController.acceptBooking);
router.put('/bookings/:id/reject', verifyToken, isProvider, providerProfileController.rejectBooking);

// Provider analytics
router.get('/analytics', verifyToken, isProvider, providerProfileController.getProviderAnalytics);

// Provider earnings
router.get('/earnings', verifyToken, isProvider, providerProfileController.getProviderEarnings);
router.get('/transactions', verifyToken, isProvider, providerProfileController.getProviderTransactions);

module.exports = router;