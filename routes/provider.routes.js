const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth');
const { isProvider } = require('../middlewares/role');

const providerController = require('../controllers/provider.controller');

// Auth routes (unprotected)
router.post('/signup', providerController.signup);
router.post('/login', providerController.login);

// Protected routes - need token verification
// Provider analytics route - both endpoints that serve the same function
router.get('/analytics', verifyToken, isProvider, providerController.getProviderAnalytics);

// Provider adds a new listing
router.post('/add-listing', verifyToken, isProvider, providerController.addListing);

// Provider profile
router.get('/profile', verifyToken, isProvider, providerController.getProviderProfile);

// Provider listings
router.get('/listings', verifyToken, isProvider, providerController.getProviderListings);

// Provider bookings - if this method exists
if (typeof providerController.getProviderBookings === 'function') {
  router.get('/bookings', verifyToken, isProvider, providerController.getProviderBookings);
}

// Generic routes
router.get('/', providerController.getAllProviders);
router.post('/', providerController.createProvider);
router.get('/:id', providerController.getProviderById);
router.put('/:id', verifyToken, providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

module.exports = router;