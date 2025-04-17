const Listing = require('../models/listing.model');

exports.getAllListings = async () => {
  return await Listing.find().populate('owner');
};

exports.getListingById = async (id) => {
  return await Listing.findById(id).populate('owner');
};

exports.createListing = async (data) => {
  const newListing = new Listing(data);
  return await newListing.save();
};

exports.updateListing = async (id, data) => {
  return await Listing.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteListing = async (id) => {
  await Listing.findByIdAndDelete(id);
};

exports.searchListings = async (params) => {
  const { latitude, longitude, page, limit, guestCount, dogCount, dateRange } = params;
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Build query
  let query = {
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
  };
  
  // Add capacity filter if people parameter is provided
  if (guestCount) {
    query['capacity.people'] = { $gte: guestCount };
  }
  
  // Add pets filter if dogs parameter is provided
  if (dogCount) {
    query['petsAllowed'] = true;
    query['capacity.pets'] = { $gte: dogCount };
  }
  
  // Add date range filter if provided
  // This would depend on your data model
  
  // Perform geospatial query
  const listings = await Listing.find(query)
    .skip(skip)
    .limit(limit + 1) // Get one extra to check if there are more
    .lean();
  
  console.log(`Found ${listings.length} listings`);
  
  // Check if there are more results
  const hasMore = listings.length > limit;
  
  // Remove the extra item if there are more
  const resultsToReturn = hasMore ? listings.slice(0, limit) : listings;
  
  // Return the results
  return {
    listings: resultsToReturn,
    hasMore
  };
};
