const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');

// Get all listings
router.get('/', listingController.getAllListings);

// Search listings by location - MOVED BEFORE /:id route
router.get('/search', listingController.searchListings);

// Get listing by ID - MOVED AFTER /search route
router.get('/:id', listingController.getListingById);

// Create a new listing
router.post('/', listingController.createListing);

// Update a listing
router.put('/:id', listingController.updateListing);

// Delete a listing
router.delete('/:id', listingController.deleteListing);

module.exports = router;
