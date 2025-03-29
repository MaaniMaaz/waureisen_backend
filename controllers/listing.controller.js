const listingService = require('../services/listing.service');

// Controller methods
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await listingService.getAllListings();
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

exports.getListingById = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.id);
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

exports.createListing = async (req, res, next) => {
  try {
    const newListing = await listingService.createListing(req.body);
    res.status(201).json(newListing);
  } catch (err) {
    next(err);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    const updatedListing = await listingService.updateListing(req.params.id, req.body);
    res.json(updatedListing);
  } catch (err) {
    next(err);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    await listingService.deleteListing(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.closeListing = async (req, res, next) => {
  try {
    const listing = await listingService.updateListing(req.params.id, { status: 'closed' });
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing closed successfully', listing });
  } catch (err) {
    next(err);
  }
};
