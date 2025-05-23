const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');

// Get all listings
router.get('/', listingController.getAllListings);

// New routes for streamed/paginated listings
router.get('/stream', listingController.getStreamedListings);
router.get('/single/:id', listingController.getSingleListing);
router.post('/batch', listingController.getListingsByIds);

// Search listings by location
router.get('/search', listingController.searchListings);

// Search listings by map bounds
router.get('/map', listingController.searchListingsByMap);

// Get listing by ID
router.get('/:id', listingController.getListingById);

// Create a new listing
router.post('/', listingController.createListing);

// Update a listing
router.put('/:id', listingController.updateListing);

// Delete a listing
router.delete('/:id', listingController.deleteListing);

router.get('/diagnostics', listingController.getListingDiagnostics);

module.exports = router;