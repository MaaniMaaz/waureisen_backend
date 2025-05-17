const Listing = require("../models/listing.model");

exports.getAllListings = async () => {
  return await Listing.find().populate("owner");
};

exports.getPaginatedListings = async (page = 1, limit = 9, searchTerm = "", filter = "all") => {
  const skip = (page - 1) * limit;
console.log(filter);

  let query = {};

  // Build search conditions
  const orConditions = [];

  if (searchTerm) {
    orConditions.push(
      { title: { $regex: searchTerm, $options: "i" } },
      { "description.general": { $regex: searchTerm, $options: "i" } }
    );
  }

  if (filter && filter !== "all") {
    if (filter === "interhome"){

      orConditions.push({
        provider: { $regex: filter, $options: "i" },
      });
    }else{

      orConditions.push({
        ownerType: { $regex: filter, $options: "i" },
      });
    }
  }

  // Only apply $or if we have conditions
  if (orConditions.length > 0) {
    query = { $or: orConditions };
  }

  // Count total documents for pagination
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

/**
 * Search for listings by map bounds
 * @param {Object} params - Search parameters
 * @returns {Object} Object containing listings and pagination info
 */
exports.searchListingsByMap = async (params) => {
  const {
    latitude,
    longitude,
    radius = 10, // Default to 500km instead of 10km
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

  // Count total matching documents (for pagination info)
  const total = await Listing.countDocuments(query);

  // Perform geospatial query
  const listings = await Listing.find(query)
    .skip(skip)
    .limit(limit + 1) // Get one extra to check if there are more
    .lean();

  console.log(`Found ${listings.length} listings for map search with radius ${radius}km`);

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

  console.log('Selected filters to match:', selectedFilters);

  return listings.filter(listing => {
    console.log('\nChecking listing:', listing._id);
    
    const amenitiesSubsection = listing.filters?.subsections?.find(
      subsection => subsection.name.toLowerCase() === 'amenities'
    );

    if (!amenitiesSubsection) {
      console.log('No Amenities subsection found');
      return false;
    }

    // Log direct filters for comparison
    const directFilters = amenitiesSubsection.filters?.map(f => f.name) || [];
    console.log('Direct filters available:', directFilters);

    // Log subsubsection filters for comparison
    const subsubsectionFilters = amenitiesSubsection.subsubsections?.flatMap(sub => 
      sub.filters?.map(f => `${sub.name} > ${f.name}`) || []
    ) || [];
    console.log('Subsubsection filters available:', subsubsectionFilters);

    const directFilterMatch = amenitiesSubsection.filters?.some(filter => {
      const match = selectedFilters.includes(filter.name);
      if (match) {
        console.log(`✓ Direct match: "${filter.name}" matches selected filter`);
      }
      return match;
    });

    const subsubsectionFilterMatch = amenitiesSubsection.subsubsections?.some(subsection => {
      return subsection.filters?.some(filter => {
        const match = selectedFilters.includes(filter.name);
        if (match) {
          console.log(`✓ Subsubsection match: "${filter.name}" in "${subsection.name}" matches selected filter`);
        }
        return match;
      });
    });

    const matches = directFilterMatch || subsubsectionFilterMatch;
    console.log(`Final result: ${matches ? 'MATCHES' : 'NO MATCH'}\n`);
    
    return matches;
  });
};

/**
 * Search for listings based on location and filters
 * @param {Object} params - Search parameters
 * @returns {Object} Object containing listings and pagination info
 */
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
    limit = 100,
    guestCount,
    dogCount,
    dateRange,
    filters,
    radius = 10, // Default to 500km if not provided
  } = params;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build query
  let query = {
    "location.type": "Point",
    status: "active",
  };

  if (latitude && longitude) {
    // Convert radius to meters
    const searchRadius = radius * 1000;
    
    query["location.coordinates"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: searchRadius, // Use the provided radius parameter (in meters)
      },
    };
  }

  if (guestCount) {
    query["capacity.people"] = { $gte: guestCount };
  }

  if (dogCount) {
    query["petsAllowed"] = true;
    query["capacity.pets"] = { $gte: dogCount };
  }

  try {
    let listings = await Listing.find(query)
      .populate('filters')
      .skip(skip)
      .limit(limit + 1)
      .lean();

    console.log(`Found ${listings.length} listings for search query with radius ${radius}km`);

    if (filters && filters.length > 0) {
      listings = applyAmenitiesFilter(listings, filters);
      console.log(`After filtering: ${listings.length} listings match the criteria`);
    }

    const hasMore = listings.length > limit;
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
