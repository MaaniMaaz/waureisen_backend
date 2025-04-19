const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');

// Get all listings
router.get('/', listingController.getAllListings);

// Search listings by location
router.get('/search', listingController.searchListings);

// NEW: Search listings by map bounds
router.get('/map', listingController.searchListingsByMap);

// Get listing by ID
router.get('/:id', listingController.getListingById);

// Create a new listing
router.post('/', listingController.createListing);

// Update a listing
router.put('/:id', listingController.updateListing);

// Delete a listing
router.delete('/:id', listingController.deleteListing);

module.exports = router;
