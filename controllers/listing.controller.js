const listingService = require("../services/listing.service");
const Listing = require('../models/listing.model');
const Filter = require('../models/filter.model');

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
    const filter = req.query.filter || "";

    const result = await listingService.getPaginatedListings(
      page,
      limit,
      search,
      filter
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
exports.getListingByIdWithFilters = async (req, res, next) => {
  try {
    const listing = await listingService.getListingByIdWithFilters(req.params.id);
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
    const oldListing = await Listing.findById(req.params.id);
    const updatedListing = await listingService.updateListing(
      req.params.id,
      req.body
    );

    // Check if the listing status was changed from 'pending approval' to 'active'
    if (
      oldListing.status !== 'active' && 
      updatedListing.status === 'active' && 
      updatedListing.ownerType === 'Provider'
    ) {
      try {
        // Get provider email
        const Provider = require('../models/provider.model');
        const provider = await Provider.findById(updatedListing.owner);
        
        if (provider && provider.email) {
          // Import the email service
          const emailService = require('../services/email.service');
          await emailService.sendListingApprovalEmail(
            provider.email,
            updatedListing
          );
          console.log(`Listing approval email sent to provider ${provider.email}`);
        }
      } catch (emailError) {
        console.error('Error sending listing approval email:', emailError);
        // Continue with the process even if the email fails
      }
    }

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
      filters,
      radius = 50, // Add default radius of 500km
    } = req.query;

    // Get search filters from headers
    const searchFiltersHeader = req.headers['searchfiltersdata'];
    let searchFilters = null;
    
    if (searchFiltersHeader) {
      try {
        searchFilters = JSON.parse(searchFiltersHeader);
        console.log('Received search filters from headers:', searchFilters);
      } catch (error) {
        console.error('Error parsing search filters from headers:', error);
      }
    } else {
      console.log('No search filters found in headers');
    }

    // Log all headers for debugging
    console.log('All request headers:', req.headers);

    // Convert parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const currentPage = parseInt(page);
    const limit = parseInt(pageSize);
    const guestCount = people ? parseInt(people) : null;
    const dogCount = dogs ? parseInt(dogs) : null;
    const searchRadius = parseInt(radius); // Parse radius to number

    // Parse filters if provided - handle both string and array formats
    let selectedFilters = null;
    if (filters) {
      try {
        // If filters is already an array (from query string), use it directly
        if (Array.isArray(filters)) {
          selectedFilters = filters;
        } else {
          // Otherwise try to parse it as JSON
          selectedFilters = JSON.parse(filters);
        }
      } catch (error) {
        console.error('Error parsing filters:', error);
        // If parsing fails, treat it as a single filter
        selectedFilters = [filters];
      }
    }

    // Merge searchFilters from headers with existing filters if needed
    if (searchFilters) {
      console.log('Merging search filters with existing filters:', { searchFilters, selectedFilters });
      selectedFilters = { ...selectedFilters, ...searchFilters };
    }

    // Log received parameters for debugging
    console.log("Search parameters:", {
      latitude,
      longitude,
      currentPage,
      limit,
      guestCount,
      dogCount,
      dateRange,
      selectedFilters,
      searchRadius, // Log the radius
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
      filters: selectedFilters,
      radius: searchRadius, // Pass the radius parameter
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
      radius = 10, // Change default radius from 10 to 500km
      neLat,
      neLng,
      swLat,
      swLng,
      page = 1,
      limit = 50,
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


// Update Listing Search logic

// Updated listing.controller.js - getStreamedListings function
// Complete updated getStreamedListings function for listing.controller.js

/**
 * Get paginated listings with proper total count and page details
 * Supports traditional pagination with page and limit parameters
 */
exports.getStreamedListings = async (req, res, next) => {
  try {
    const {
      limit = 12,
      skip = 0,
      page = 1,
      lat,
      lng,
      radius = 500,
      people,
      dogs,
      filters: filtersParam,
      priceMin,
      priceMax,
      searchFilters
    } = req.query;

    console.log("Search filters:", searchFilters);

    console.log("Raw filters param:", filtersParam);
    console.log("Pagination params:", { limit, skip, page });

    // Initialize empty filters
    let filters = {};
    
    // Process filters with careful handling for double-encoded strings
    if (filtersParam) {
      try {
        // Detect if this is a JSON string (already stringified)
        // and handle various possible formats
        let parsedFilters;
        
        if (typeof filtersParam === 'string') {
          // Try to clean the string if it looks like it's double-encoded
          let cleanedParam = filtersParam;
          
          // Remove outer quotes if present
          if (cleanedParam.startsWith('"') && cleanedParam.endsWith('"')) {
            cleanedParam = cleanedParam.slice(1, -1);
          }
          
          // Replace escaped quotes if needed
          cleanedParam = cleanedParam.replace(/\\"/g, '"');
          
          // Try to parse the JSON
          parsedFilters = JSON.parse(cleanedParam);
        } else {
          // If it's already an object
          parsedFilters = filtersParam;
        }
        
        // Ensure we got a proper object
        if (parsedFilters && typeof parsedFilters === 'object') {
          filters = parsedFilters;
          console.log("Successfully parsed filters:", filters);
        }
      } catch (error) {
        console.error("Error parsing filters:", error, filtersParam);
        // Continue with empty filters
      }
    }

    // Setup location if coordinates provided
    const location = lat && lng ? {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    } : null;

    // Add guest and dog count to filters
    if (people) {
      filters.guestCount = parseInt(people);
    }
    
    if (dogs) {
      filters.dogCount = parseInt(dogs);
    }

    // Create a separate priceRange object
    let priceRangeObj = {};
    
    if (priceMin) {
      priceRangeObj.min = parseInt(priceMin);
    }
    
    if (priceMax) {
      priceRangeObj.max = parseInt(priceMax);
    }
    
    // Only add priceRange if we have either min or max
    if (Object.keys(priceRangeObj).length > 0) {
      filters.priceRange = priceRangeObj;
    }

    console.log("Processed filters:", JSON.stringify(filters, null, 2));
    console.log("Using radius:", radius, "km");

    // First, get all listings without pagination to apply filters
    const allResults = await listingService.getStreamedListings({
      limit: 1000, // Get a large number to ensure we get all listings
      skip: 0,
      page: 1,
      filters,
      location,
      radius: parseFloat(radius)
    });

    let filteredListings = allResults.listings;
    let totalCount = allResults.total;

    // Apply search filters to the results if they exist
    if (searchFilters) {
      try {
        const parsedFilters = typeof searchFilters === 'string' ? JSON.parse(searchFilters) : searchFilters;
        console.log("Parsed search filters:", parsedFilters);
        
        if (parsedFilters.ranges) {
          // Filter listings based on ranges
          filteredListings = allResults.listings.filter(listing => {
            // Check rooms range
            if (parsedFilters.ranges.rooms) {
              const rooms = listing.bedRooms || 0;
              if (rooms < parsedFilters.ranges.rooms.min || rooms > parsedFilters.ranges.rooms.max) {
                return false;
              }
            }

            // Check bathrooms range
            if (parsedFilters.ranges.bathrooms) {
              const bathrooms = listing.washrooms || 0;
              if (bathrooms < parsedFilters.ranges.bathrooms.min || bathrooms > parsedFilters.ranges.bathrooms.max) {
                return false;
              }
            }

            // Check price range
            if (parsedFilters.ranges.price) {
              const price = listing.pricePerNight?.price || 0;
              if (price < parsedFilters.ranges.price.min || price > parsedFilters.ranges.price.max) {
                return false;
              }
            }

            return true;
          });
        }

        // Apply facility filters if they exist
        if (parsedFilters.selected) {
          console.log("Applying facility filters:", parsedFilters.selected);
          const facilityKeys = [
            'dog facilities',
            'facilities parking',
            'facilities wellness',
            'facilities accommodation features',
            'facilities kids',
            'facilities kitchen',
            'facilities main filters',
            'facilities smoking',
            'facilities sport',
            'facilities to do nearby',
            'facilities view'
          ];

          // Populate filters for all listings
          const populatedListings = await Promise.all(
            filteredListings.map(async (listing) => {
              if (listing.filters) {
                const populatedFilters = await Filter.findById(listing.filters).lean();
                return { ...listing, filters: populatedFilters };
              }
              return listing;
            })
          );

          filteredListings = populatedListings.filter(listing => {
            if (!listing.filters) return false;

            //console.log("Listing filters:", listing.filters);
            // Find the Amenities subsection
            const amenitiesSubsection = listing.filters.subsections?.find(sub => sub.name === 'Amenities');
            if (!amenitiesSubsection) return false;

            for (const key of facilityKeys) {
              const arr = parsedFilters.selected[key];
              if (!arr || arr.length === 0) continue;

              //console.log("Arrrrrrrrrrr:", arr);

              // Find matching subsubsection by comparing lowercase names
              const matchingSubsubsection = amenitiesSubsection.subsubsections?.find(
                subsub => subsub.name.toLowerCase() === key.toLowerCase()
              );

              console.log("Matching subsubsection:", matchingSubsubsection);
              console.log("Key:", key);
              console.log("Filters:", parsedFilters.selected[key]);

              if (!matchingSubsubsection) return false;

              // Check if any of the values match the filter names (case-sensitive)
              const hasMatchingFilter = matchingSubsubsection.filters?.some(
                filter => arr.includes(filter.name)
              );

              if (!hasMatchingFilter) return false;
            }
            return true;
          });
        }

        // Update total count to reflect filtered results
        totalCount = filteredListings.length;
        
        console.log("Filtering results:", {
          originalTotal: allResults.total,
          filteredCount: filteredListings.length,
          newTotal: totalCount
        });
      } catch (error) {
        console.error("Error applying search filters:", error);
      }
    }

    // Now apply pagination to the filtered results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedListings = filteredListings.slice(startIndex, endIndex);

    // Calculate total pages based on filtered total
    const totalPages = Math.ceil(totalCount / parseInt(limit)) || 1;
    
    console.log(`Returning ${paginatedListings.length} listings out of ${totalCount} total (page ${page} of ${totalPages})`);

    // Return success response with data and pagination info
    res.status(200).json({
      success: true,
      listings: paginatedListings,
      total: totalCount,
      page: parseInt(page),
      totalPages: totalPages,
      hasMore: parseInt(page) < totalPages
    });

  } catch (error) {
    console.error("Error fetching streamed listings:", error);
    res.status(200).json({
      success: true,
      listings: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false,
      error: error.message
    });
  }
};


/**
 * Get a single listing by ID
 * For individual fetching during stream loading
 */
exports.getSingleListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Listing ID is required"
      });
    }

    const listing = await listingService.getSingleListing(id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    res.status(200).json({
      success: true,
      listing
    });
  } catch (error) {
    console.error(`Error fetching single listing:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching listing",
      error: error.message
    });
  }
};

/**
 * Get multiple listings by IDs
 * For efficient batch loading
 */
exports.getListingsByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid listing IDs array is required"
      });
    }

    const listings = await listingService.getListingsByIds(ids);
    
    res.status(200).json({
      success: true,
      listings
    });
  } catch (error) {
    console.error("Error fetching listings by IDs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching listings",
      error: error.message
    });
  }
};



exports.getListingDiagnostics = async (req, res, next) => {
  try {
    const diagnostics = {
      counts: {},
      schema: {},
      samples: []
    };
    
    // Get base counts
    diagnostics.counts.total = await Listing.countDocuments();
    diagnostics.counts.active = await Listing.countDocuments({ status: "active" });
    diagnostics.counts.withCoordinates = await Listing.countDocuments({ 
      "location.coordinates": { $exists: true } 
    });
    
    // Check for various data issues
    diagnostics.counts.withCapacity = await Listing.countDocuments({ 
      "capacity.people": { $exists: true } 
    });
    
    diagnostics.counts.withCapacityAndActive = await Listing.countDocuments({ 
      status: "active",
      "capacity.people": { $exists: true } 
    });
    
    diagnostics.counts.withCapacityGTE1 = await Listing.countDocuments({ 
      "capacity.people": { $gte: 1 } 
    });
    
    diagnostics.counts.withActiveAndCapacityGTE1 = await Listing.countDocuments({ 
      status: "active",
      "capacity.people": { $gte: 1 } 
    });
    
    // Check price
    diagnostics.counts.withPrice = await Listing.countDocuments({ 
      "pricePerNight.price": { $exists: true } 
    });
    
    diagnostics.counts.withPriceLTE10000 = await Listing.countDocuments({ 
      "pricePerNight.price": { $lte: 10000 } 
    });
    
    // Get schema information - what fields do listings have?
    try {
      // Get a sample listing
      const sampleListing = await Listing.findOne({ status: "active" }).lean();
      
      if (sampleListing) {
        // Extract schema
        diagnostics.schema.topLevel = Object.keys(sampleListing);
        
        if (sampleListing.capacity) {
          diagnostics.schema.capacity = Object.keys(sampleListing.capacity);
        }
        
        if (sampleListing.location) {
          diagnostics.schema.location = Object.keys(sampleListing.location);
          
          if (sampleListing.location.coordinates) {
            diagnostics.schema.coordinates = 
              `Array with ${sampleListing.location.coordinates.length} items: ${sampleListing.location.coordinates}`;
          }
        }
        
        if (sampleListing.pricePerNight) {
          diagnostics.schema.pricePerNight = Object.keys(sampleListing.pricePerNight);
        }
      }
    } catch (error) {
      diagnostics.schemaError = error.message;
    }
    
    // Get a few sample listings for inspection
    try {
      // Get 3 random listings
      const randomListings = await Listing.aggregate([
        { $match: { status: "active" } },
        { $sample: { size: 3 } }
      ]);
      
      // Get details of each listing
      for (const listing of randomListings) {
        const simplifiedListing = {
          _id: listing._id,
          title: listing.title,
          status: listing.status,
          coordinates: listing.location?.coordinates,
          locationType: listing.location?.type,
          capacity: listing.capacity,
          pricePerNight: listing.pricePerNight
        };
        
        diagnostics.samples.push(simplifiedListing);
      }
    } catch (error) {
      diagnostics.samplesError = error.message;
    }
    
    // Return the diagnostic data
    res.status(200).json({
      success: true,
      diagnostics
    });
  } catch (error) {
    console.error("Error getting listing diagnostics:", error);
    res.status(500).json({
      success: false,
      message: "Error getting listing diagnostics",
      error: error.message
    });
  }
};