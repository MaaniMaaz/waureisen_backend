const Listing = require("../models/listing.model");

exports.getAllListings = async () => {
  return await Listing.find().populate("owner");
};

exports.getPaginatedListings = async (page = 1, limit = 9, searchTerm = "") => {
  const skip = (page - 1) * limit;

  // Build the search query
  let query = {};
  if (searchTerm) {
    query = {
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { "description.general": { $regex: searchTerm, $options: "i" } },
      ],
    };
  }

  // Count total documents for pagination info
  const total = await Listing.countDocuments(query);

  // Get listings with pagination
  const listings = await Listing.find(query)
    .populate("owner")
    .sort({ createdAt: -1 }) // Latest first
    .skip(skip)
    .limit(limit);

  return {
    listings,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
  };
};

exports.getListingById = async (id) => {
  return await Listing.findById(id).populate("owner");
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

exports.searchListingsByMap = async (params) => {
  const {
    latitude,
    longitude,
    radius = 10,
    bounds,
    page,
    limit,
    guestCount,
    dogCount,
    dateRange,
  } = params;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build query
  let query = {
    "location.type": "Point",
    status: "active", // Only return active listings
  };

  // Use bounds if provided, otherwise use radius
  if (bounds) {
    // MongoDB $geoWithin with $box query
    query["location.coordinates"] = {
      $geoWithin: {
        $box: [
          [bounds.sw.lng, bounds.sw.lat], // Southwest corner [lng, lat]
          [bounds.ne.lng, bounds.ne.lat], // Northeast corner [lng, lat]
        ],
      },
    };
  } else {
    // Use radius-based search
    query["location.coordinates"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON uses [lng, lat] order
        },
        $maxDistance: radius * 1000, // Convert km to meters
      },
    };
  }

  // Add capacity filter if people parameter is provided
  if (guestCount) {
    query["capacity.people"] = { $gte: guestCount };
  }

  // Add pets filter if dogs parameter is provided
  if (dogCount) {
    query["petsAllowed"] = true;
    query["capacity.pets"] = { $gte: dogCount };
  }

  // Add date range filter if provided
  // This would depend on your data model

  // Count total matching documents (for pagination info)
  const total = await Listing.countDocuments(query);

  // Perform geospatial query
  const listings = await Listing.find(query)
    .skip(skip)
    .limit(limit + 1) // Get one extra to check if there are more
    .lean();

  console.log(`Found ${listings.length} listings for map search`);

  // Check if there are more results
  const hasMore = listings.length > limit;

  // Remove the extra item if there are more
  if (hasMore) {
    listings.pop();
  }

  return {
    listings,
    hasMore,
    total,
  };
};

/**
 * Helper function to filter listings by amenities
 * @param {Array} listings - List of listings to filter
 * @param {Array} selectedFilters - Array of selected filter names
 * @returns {Array} Filtered listings
 */
const applyAmenitiesFilter = (listings, selectedFilters) => {
  if (!selectedFilters || selectedFilters.length === 0) {
    return listings;
  }

  return listings.filter(listing => {
    // Find the Amenities subsection in the listing's filters
    const amenitiesSubsection = listing.filters?.subsections?.find(
      subsection => subsection.name.toLowerCase() === 'amenities'
    );

    if (!amenitiesSubsection) {
      return false;
    }

    // Check both direct filters and subsubsection filters
    const hasDirectFilterMatch = amenitiesSubsection.filters?.some(filter => 
      selectedFilters.includes(filter.name)
    );

    const hasSubsubsectionFilterMatch = amenitiesSubsection.subsubsections?.some(subsection => 
      subsection.filters?.some(filter => selectedFilters.includes(filter.name))
    );

    return hasDirectFilterMatch || hasSubsubsectionFilterMatch;
  });
};

/**
 * Search for listings based on location and filters
 * @param {Object} params - Search parameters
 * @returns {Object} Object containing listings and pagination info
 */
exports.searchListings = async (params) => {
  const {
    latitude,
    longitude,
    page = 1,
    limit = 10,
    guestCount,
    dogCount,
    dateRange,
    filters, // New parameter for selected filters
  } = params;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build query
  let query = {
    "location.type": "Point",
    status: "active", // Only return active listings
  };

  // Add geospatial query if coordinates are provided
  if (latitude && longitude) {
    query["location.coordinates"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON uses [lng, lat] order
        },
        $maxDistance: 50000, // 50km radius
      },
    };
  }

  // Add capacity filter if people parameter is provided
  if (guestCount) {
    query["capacity.people"] = { $gte: guestCount };
  }

  // Add pets filter if dogs parameter is provided
  if (dogCount) {
    query["petsAllowed"] = true;
    query["capacity.pets"] = { $gte: dogCount };
  }

  // Add date range filter if provided
  // This would depend on your data model

  try {
    // Get one extra to check if there are more results
    let listings = await Listing.find(query)
      .skip(skip)
      .limit(limit + 1)
      .lean();

    console.log(`Found ${listings.length} listings for search query`);

    // Apply amenities filter if filters are provided
    if (filters && filters.length > 0) {
      listings = applyAmenitiesFilter(listings, filters);
    }

    // Check if there are more results
    const hasMore = listings.length > limit;

    // Remove the extra item if there are more
    if (hasMore) {
      listings.pop();
    }

    return {
      listings,
      hasMore,
    };
  } catch (error) {
    console.error("Error in searchListings service:", error);
    throw error;
  }
};

/**
 * Delete a listing by ID for a specific provider
 * @param {string} listingId - The listing ID
 * @param {string} providerId - The provider ID (for ownership verification)
 * @returns {Promise<boolean>} Success indicator
 */
exports.deleteProviderListing = async (listingId, providerId) => {
  try {
    // First verify the listing belongs to this provider
    const listing = await Listing.findOne({
      _id: listingId,
      owner: providerId,
      ownerType: "Provider",
    });

    if (!listing) {
      throw new Error("Listing not found or not owned by this provider");
    }

    await Listing.findByIdAndDelete(listingId);
    return true;
  } catch (error) {
    console.error("Error deleting provider listing:", error);
    throw error;
  }
};
