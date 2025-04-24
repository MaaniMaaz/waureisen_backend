const listingService = require("../services/listing.service");

// Controller methods
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await listingService.getAllListings();
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

// New method for paginated listings
exports.getPaginatedListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || "";

    const result = await listingService.getPaginatedListings(
      page,
      limit,
      search
    );
    res.json(result);
  } catch (err) {
    console.error("Error fetching paginated listings:", err);
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
    const updatedListing = await listingService.updateListing(
      req.params.id,
      req.body
    );
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
    const listing = await listingService.updateListing(req.params.id, {
      status: "closed",
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({ message: "Listing closed successfully", listing });
  } catch (err) {
    next(err);
  }
};

// Search listings by location
exports.searchListings = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      page = 1,
      pageSize = 10,
      people,
      dogs,
      dateRange,
    } = req.query;

    // Convert parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const currentPage = parseInt(page);
    const limit = parseInt(pageSize);
    const guestCount = people ? parseInt(people) : null;
    const dogCount = dogs ? parseInt(dogs) : null;

    // Log received parameters for debugging
    console.log("Search parameters:", {
      latitude,
      longitude,
      currentPage,
      limit,
      guestCount,
      dogCount,
      dateRange,
    });

    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    // Use the service to search listings instead of directly using Listing model
    const searchParams = {
      latitude,
      longitude,
      page: currentPage,
      limit,
      guestCount,
      dogCount,
      dateRange,
    };

    const result = await listingService.searchListings(searchParams);

    // Return the results
    res.status(200).json({
      success: true,
      listings: result.listings,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error searching listings:", error);
    res.status(500).json({
      success: false,
      message: "Error searching listings",
      error: error.message,
    });
  }
};

// Search listings by map bounds
exports.searchListingsByMap = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius = 10,
      neLat,
      neLng,
      swLat,
      swLng,
      page = 1,
      limit = 10,
      people,
      dogs,
      dateRange,
    } = req.query;

    // Convert parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);
    const currentPage = parseInt(page);
    const resultsLimit = parseInt(limit);
    const guestCount = people ? parseInt(people) : null;
    const dogCount = dogs ? parseInt(dogs) : null;

    // Log received parameters for debugging
    console.log("Map search parameters:", {
      latitude,
      longitude,
      searchRadius,
      bounds: neLat ? { neLat, neLng, swLat, swLng } : "Not provided",
      currentPage,
      resultsLimit,
      guestCount,
      dogCount,
      dateRange,
    });

    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    // Use the service to search listings
    const searchParams = {
      latitude,
      longitude,
      radius: searchRadius,
      bounds: neLat
        ? {
            ne: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
            sw: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
          }
        : null,
      page: currentPage,
      limit: resultsLimit,
      guestCount,
      dogCount,
      dateRange,
    };

    const result = await listingService.searchListingsByMap(searchParams);

    // Return the results
    res.status(200).json({
      success: true,
      listings: result.listings,
      hasMore: result.hasMore,
      total: result.total,
    });
  } catch (error) {
    console.error("Error searching listings by map:", error);
    res.status(500).json({
      success: false,
      message: "Error searching listings by map",
      error: error.message,
    });
  }
};
