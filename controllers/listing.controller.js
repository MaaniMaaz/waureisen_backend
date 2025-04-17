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

// Search listings by location
exports.searchListings = async (req, res, next) => {
  try {
    const { lat, lng, page = 1, pageSize = 10 } = req.query;
    
    // Convert parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const currentPage = parseInt(page);
    const limit = parseInt(pageSize);
    
    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid latitude or longitude' 
      });
    }
    
    // Calculate skip value for pagination
    const skip = (currentPage - 1) * limit;
    
    // Perform geospatial query
    const listings = await Listing.find({
      'location.type': 'Point',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON uses [lng, lat] order
          },
          $maxDistance: 50000 // 50km radius
        }
      },
      'status': 'active' // Only return active listings
    })
    .skip(skip)
    .limit(limit + 1) // Get one extra to check if there are more
    .lean();
    
    // Check if there are more results
    const hasMore = listings.length > limit;
    
    // Remove the extra item if there are more
    const resultsToReturn = hasMore ? listings.slice(0, limit) : listings;
    
    // Return the results
    res.status(200).json({
      success: true,
      listings: resultsToReturn,
      hasMore
    });
  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching listings',
      error: error.message
    });
  }
};
