const Listing = require("../models/listing.model");

const {storeListingInRedis,getStoredListings } = require("../functions/redis");





exports.getListingById = async (id) => {
  return await Listing.findById(id).populate("owner");
};
exports.getListingByIdWithFilters = async (id) => {
  return await Listing.findById(id).populate("filters");
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


// New update logic for Search Listings

/**
 * Simplified implementation for getStreamedListings with proper filter handling
 * Modified to use the fallback approach by default to avoid MongoDB errors
 * 
 * @param {Object} params - Search parameters
 * @param {number} params.limit - Number of items per page
 * @param {number} params.skip - Number of items to skip
 * @param {number} params.page - Current page number
 * @param {Object} params.filters - Filter criteria
 * @param {Object} params.location - Location coordinates
 * @param {number} params.radius - Search radius in km
 * @param {Object} params.sort - Sort criteria
 * @returns {Promise<Object>} Paginated results with items and pagination info
 */
// exports.getStreamedListings = async (params) => {
//   try {
//     // Skip the aggregation pipeline approach entirely
//     // It's causing MongoDB errors with our specific dataset configuration
//     // Just use the fallback approach which is more reliable
//     return await getStreamedListingsFallback(params);
//   } catch (error) {
//     console.error("Error in getStreamedListings:", error);
    
//     // Return empty results for graceful failure
//     return {
//       listings: [],
//       total: 0,
//       page: 1,
//       totalPages: 0,
//       hasMore: false
//     };
//   }
// };

// /**
//  * Fallback implementation that manually calculates distances
//  * Enhanced with filter handling for all filter types
//  */
// async function getStreamedListingsFallback(params) {
//   const {
//     limit = 12,
//     skip = 0,
//     page = 1,
//     filters = {},
//     location = null,
//     radius = 500,
//     sort = { createdAt: -1 }
//   } = params;

//   try {
//     console.log("Using fallback implementation with manual distance calculation");
    
//     // Build the base query
//     const userCoordinates = [location?.lng, location?.lat];
//    let query = {
//   status: "active",
//   "location.coordinates": {
//     $nearSphere: {
//       $geometry: {
//         type: "Point",
//         coordinates: userCoordinates,
//       },
//       $maxDistance: 500000, // 500 km in meters
//     },
//   },
// };
    
//     // Apply standard filters
//     // Price range filter
// //     if (filters.priceRange) {
// //   const { min, max } = filters.priceRange;
// //   query["price"] = {};
// //   if (max) {
// //     query["price"]["$lte"] = parseInt(max);
// //   }

// //   if (min) {
// //     query["price"]["$gte"] = parseInt(min);
// //   }

// // }

//     console.log(filters , "filters ");
    
//     // Price range from ranges object (from more filters modal)
//     if (filters.ranges && filters.ranges.price) {
//       if (filters.ranges.price.min > 0) {
//         console.log("mini wala chala");
        
//         query["price"] = query["price"] || {};
//         query["price"].$gte = parseInt(filters.ranges.price.min);
//       }
//       if (filters.ranges.price.max > 0) {
//         query["price"] = query["price"] || {};
//         query["price"].$lte = parseInt(filters.ranges.price.max);
//       }
      
//     }
    
//     // Dog filter
//     if (filters.dogCount) {
//       query["petsAllowed"] = true;
//       query["capacity.pets"] = { $exists: true };
//     }
    
//     // Handle amenities filters
//     if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
//       // Create an $or query for amenities
//       const amenityQuery = [];
      
//       // Check both direct filters and subsubsection filters
//       amenityQuery.push({
//         "filters.subsections.filters.name": { $in: filters.amenities }
//       });
      
//       amenityQuery.push({
//         "filters.subsections.subsubsections.filters.name": { $in: filters.amenities }
//       });
      
//       if (amenityQuery.length > 0) {
//         query.$or = amenityQuery;
//       }
      
//       console.log("Added amenities filter:", JSON.stringify(amenityQuery));
//     }
    
//     // If location is provided, use centerSphere for the radius
//     if (location && location.lat && location.lng) {
//       const searchRadius = parseFloat(radius) * 1000;
//       query["location.coordinates"] = {
//         $geoWithin: {
//           $centerSphere: [
//             [parseFloat(location.lng), parseFloat(location.lat)],
//             searchRadius / 6371000
//           ]
//         }
//       };
//     }
    
//     console.log("Using fallback query:", JSON.stringify(query, null, 2));
    
//     // Get all listings matching the criteria
//     // For very large datasets, consider pagination at the DB level
//     // const allMatchingListings = await Listing.find(query)
//     //   .populate("owner")
      
//     //   .lean();
//       const allMatchingListings = await getStoredListings()
    
//     console.log(`Found ${allMatchingListings.length} listings matching the query`);
    
//     // Calculate distances and add info for all listings
//     let processedListings = allMatchingListings;
//     if (location && location.lat && location.lng) {
//       processedListings = allMatchingListings.map(listing => {
//         if (listing.location && listing.location.coordinates && 
//             Array.isArray(listing.location.coordinates) && 
//             listing.location.coordinates.length === 2) {
//           const [lng, lat] = listing.location.coordinates;
//           const distance = calculateDistance(
//             parseFloat(location.lat),
//             parseFloat(location.lng),
//             parseFloat(lat),
//             parseFloat(lng)
//           );
          
//           const distanceKm = Math.round(distance / 100) / 10; // Round to 1 decimal
          
//           return {
//             ...listing,
//             distance, // Store the raw distance for sorting
//             distanceInfo: {
//               distanceMeters: distance,
//               distanceKm,
//               distanceText: `${distanceKm} km away`
//             }
//           };
//         }
        
//         // If no coordinates, put at the end
//         return {
//           ...listing,
//           distance: Number.MAX_SAFE_INTEGER,
//           distanceInfo: {
//             distanceMeters: -1,
//             distanceKm: -1,
//             distanceText: `Distance unknown`
//           }
//         };
//       });
      
//       // Sort by distance (nearest first)
//       processedListings.sort((a, b) => a.distance - b.distance);
//       console.log(`Sorted ${processedListings.length} listings by distance`);
//     }
    
//     // Apply capacity filter if needed
//     if (filters.guestCount && parseInt(filters.guestCount) > 0) {
//       console.log(`Filtering for guest count >= ${filters.guestCount}`);
//       const beforeCount = processedListings.length;
      
//       processedListings = processedListings.filter(listing => {
//         if (!listing.capacity) return true;
        
//         const capacityValue = 
//           (typeof listing.capacity.people !== 'undefined' ? listing.capacity.people : 
//           (typeof listing.capacity.capacity !== 'undefined' ? listing.capacity.capacity : 
//           (typeof listing.capacity === 'number' ? listing.capacity : 999)));
        
//         const numericCapacity = parseInt(capacityValue);
        
//         return isNaN(numericCapacity) || numericCapacity >= parseInt(filters.guestCount);
//       });
      
//       console.log(`After capacity filtering: ${processedListings.length}/${beforeCount} listings remain`);
//     }
    
//     // Apply additional ranges filters from more filters modal
//     if (filters.ranges) {
//       // People range
//       if (filters.ranges.people && filters.ranges.people.min > 1) {
//         const beforeCount = processedListings.length;
//         processedListings = processedListings.filter(listing => {
//           const capacity = listing.capacity?.people || 0;
//           return capacity >= filters.ranges.people.min;
//         });
//         console.log(`After people min filtering: ${processedListings.length}/${beforeCount} listings remain`);
//       }
      
//       // Room range
//       if (filters.ranges.rooms && filters.ranges.rooms.min > 1) {
//         const beforeCount = processedListings.length;
//         processedListings = processedListings.filter(listing => {
//           const rooms = listing.rooms || 0;
//           return rooms >= filters.ranges.rooms.min;
//         });
//         console.log(`After rooms min filtering: ${processedListings.length}/${beforeCount} listings remain`);
//       }
      
//       // Bathroom range
//       if (filters.ranges.bathrooms && filters.ranges.bathrooms.min > 1) {
//         const beforeCount = processedListings.length;
//         processedListings = processedListings.filter(listing => {
//           const bathrooms = listing.bathrooms || 0;
//           return bathrooms >= filters.ranges.bathrooms.min;
//         });
//         console.log(`After bathrooms min filtering: ${processedListings.length}/${beforeCount} listings remain`);
//       }
//     }
    
//     // Apply filters from the "selected" object (for more filters modal)
//     if (filters.selected) {
//       const selectedFilters = Object.entries(filters.selected)
//         .filter(([_, values]) => Array.isArray(values) && values.length > 0)
//         .flatMap(([_, values]) => values);
      
//       if (selectedFilters.length > 0) {
//         console.log(`Applying selected filters: ${selectedFilters.join(', ')}`);
//         const beforeCount = processedListings.length;
        
//         processedListings = processedListings.filter(listing => {
//           // Extract all filters from the listing
//           const listingFilters = [];
          
//           // Check direct filters
//           if (listing.filters && listing.filters.subsections) {
//             for (const subsection of listing.filters.subsections) {
//               if (subsection.filters) {
//                 listingFilters.push(...subsection.filters.map(f => f.name));
//               }
              
//               if (subsection.subsubsections) {
//                 for (const subsubsection of subsection.subsubsections) {
//                   if (subsubsection.filters) {
//                     listingFilters.push(...subsubsection.filters.map(f => f.name));
//                   }
//                 }
//               }
//             }
//           }
          
//           // Check if any selected filters match
//           return selectedFilters.some(filter => listingFilters.includes(filter));
//         });
        
//         console.log(`After selected filters: ${processedListings.length}/${beforeCount} listings remain`);
//       }
//     }
    
//     // Process Interhome prices if needed
//     // if (typeof fetchInterhomePrices === 'function') {
//     //   // Get date from filters
//     //   const checkInDate = filters.dateRange?.start ? formatDate(filters.dateRange.start) : null;
      
//     //   if (checkInDate) {
//     //     const interhomeListings = processedListings.filter(listing => 
//     //       listing.provider === 'Interhome' && listing.Code
//     //     );
        
//     //     if (interhomeListings.length > 0) {
//     //       console.log(`Processing prices for ${interhomeListings.length} Interhome listings`);
          
//     //       // Process them in parallel
//     //       await Promise.all(interhomeListings.map(async (listing) => {
//     //         try {
//     //           // Find the listing in our processed list
//     //           const listingIndex = processedListings.findIndex(l => l._id.toString() === listing._id.toString());
//     //           if (listingIndex === -1) return;
              
//     //           // Fetch price data
//     //           const priceData = await fetchInterhomePrices({
//     //             accommodationCode: listing.Code,
//     //             checkInDate,
//     //             los: true,
//     //           });
              
//     //           // Process price data
//     //           if (priceData?.priceList?.prices?.price?.length > 0) {
//     //             const duration7Options = priceData.priceList.prices.price
//     //               .filter(option => option.duration === 7)
//     //               .sort((a, b) => a.paxUpTo - b.paxUpTo);
                
//     //             if (duration7Options.length > 0) {
//     //               const selectedOption = duration7Options[0];
//     //               const calculatedPricePerNight = Math.round(selectedOption.price / 7);
                  
//     //               // Update the listing in our processed list
//     //               processedListings[listingIndex] = {
//     //                 ...processedListings[listingIndex],
//     //                 interhomePriceData: priceData,
//     //                 pricePerNight: {
//     //                   price: calculatedPricePerNight,
//     //                   currency: priceData.priceList.currency || 'CHF',
//     //                   totalPrice: selectedOption.price,
//     //                   duration: 7,
//     //                   paxUpTo: selectedOption.paxUpTo,
//     //                 }
//     //               };
//     //             }
//     //           }
//     //         } catch (error) {
//     //           console.warn(`Failed to fetch Interhome prices for listing ${listing._id}:`, error);
//     //         }
//     //       }));
          
//     //       console.log('Finished processing Interhome prices');
//     //     }
//     //   }
//     // }
    
//     // Calculate total count for pagination
//     const totalFilteredListings = processedListings.length;
//     console.log(`Total filtered listings: ${totalFilteredListings}`);
    
//     // Apply pagination
//     const startIndex = parseInt(skip);
//     const endIndex = startIndex + parseInt(limit);
//     const paginatedListings = processedListings.slice(startIndex, endIndex);
    
//     // Calculate pagination info
//     const totalPages = Math.ceil(totalFilteredListings / parseInt(limit)) || 1;
//     const hasMore = endIndex < totalFilteredListings;
    
//     console.log(`Returning ${paginatedListings.length} listings for page ${page}/${totalPages}`);
    
//     return {
//       listings: paginatedListings,
//       total: totalFilteredListings,
//       page: parseInt(page),
//       totalPages,
//       hasMore
//     };
//   } catch (error) {
//     console.error("Error in getStreamedListingsFallback:", error);
//     return {
//       listings: [],
//       total: 0,
//       page: 1,
//       totalPages: 0,
//       hasMore: false
//     };
//   }
// }


function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

exports.getStreamedListings = async (params) => {
  try {
    const {
      limit = 12,
      skip = 0,
      page = 1,
      filters = {},
      location = null,
      radius = 5000,
      searchFilters
    } = params;

    console.log("Getting listings with filters:", filters);
    
    // Get all listings from Redis
    let allListings = await getStoredListings();
    
    if (!allListings || allListings.length === 0) {
      return {
        listings: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        hasMore: false
      };
    }

    let filteredListings = [...allListings];

    // Apply location filtering
    if (location && location.lat && location.lng) {
      const radiusInMeters = parseFloat(150) * 1000;
      
      filteredListings = filteredListings
        .map(listing => {
          if (listing.location && listing.location.coordinates && 
              Array.isArray(listing.location.coordinates) && 
              listing.location.coordinates.length === 2) {
            const [lng, lat] = listing.location.coordinates;
            const distance = calculateDistance(
              parseFloat(location.lat),
              parseFloat(location.lng),
              parseFloat(lat),
              parseFloat(lng)
            );
            
            return {
              ...listing,
              distance,
              distanceInfo: {
                distanceKm: Math.round(distance / 100) / 10,
                distanceText: `${Math.round(distance / 100) / 10} km away`
              }
            };
          }
          return { ...listing, distance: Number.MAX_SAFE_INTEGER };
        })
        .filter(listing => listing.distance <= radiusInMeters)
        .sort((a, b) => a.distance - b.distance);
    }

    // Apply capacity filter
    if (filters.guestCount && parseInt(filters.guestCount) > 0) {
      filteredListings = filteredListings.filter(listing => {
        const capacity = listing?.maxGuests ;
        return parseInt(capacity) >= parseInt(filters.guestCount);
      });
    }

    // Apply dog filter
    if (filters.dogCount && parseInt(filters.dogCount) > 0) {
      filteredListings = filteredListings.filter(listing => {
        const capacity = listing?.maxDogs ;
        return parseInt(capacity) >= parseInt(filters.dogCount);
      });
    }

    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
  console.log("Applying date filter:", filters.dateRange);
  
  filteredListings = filteredListings.filter(listing => {
    // Check if listing has dates array
    if (!listing.dates || !Array.isArray(listing.dates) || listing.dates.length === 0) {
      console.log(`Listing ${listing._id || listing.id} has no available dates`);
      return false;
    }
    
    // Generate all dates between start and end (inclusive)
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    const requiredDates = [];
    
    // Create array of all dates in the range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      requiredDates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    
    console.log("Required dates:", requiredDates);
    console.log(`Listing ${listing._id || listing.id} available dates:`, listing.dates.slice(0, 5), "...");
    
    // Check if all required dates are available in listing.dates
    const isAvailable = requiredDates.every(requiredDate => 
      listing.dates.includes(requiredDate)
    );
    
    if (!isAvailable) {
      // Find missing dates for debugging
      const missingDates = requiredDates.filter(date => !listing.dates.includes(date));
      console.log(`Listing ${listing._id || listing.id} missing dates:`, missingDates);
    }
    
    return isAvailable;
  });
  
  console.log(`After date filtering: ${filteredListings.length} listings available for ${filters.dateRange.start} to ${filters.dateRange.end}`);
}

    // Apply price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filteredListings = filteredListings.filter(listing => {
        const price = listing.pricePerNight?.price || listing.price || 0;
        if (min && price < min) return false;
        if (max && price > max) return false;
        return true;
      });
    }

    // Apply search filters (from frontend search modal)
    if (searchFilters) {
      try {
        const parsedSearchFilters = typeof searchFilters === 'string' 
          ? JSON.parse(searchFilters) 
          : searchFilters;

        // Apply range filters
        if (parsedSearchFilters.ranges) {
          const { ranges } = parsedSearchFilters;
          
          filteredListings = filteredListings.filter(listing => {
            // Rooms filter
            if (ranges.rooms) {
              const rooms = listing.bedRooms || listing.rooms || 0;
              if (rooms < ranges.rooms.min || rooms > ranges.rooms.max) return false;
            }
            
            // Bathrooms filter
            if (ranges.bathrooms) {
              const bathrooms = listing.washrooms || listing.bathrooms || 0;
              if (bathrooms < ranges.bathrooms.min || bathrooms > ranges.bathrooms.max) return false;
            }
            
            // Price filter
            if (ranges.price) {
              const price = listing.pricePerNight?.price || listing.price || 0;
              if (price < ranges.price.min || price > ranges.price.max) return false;
            }
            
            return true;
          });
        }

        // Apply facility filters
        if (parsedSearchFilters.selected) {
          const selectedFilters = Object.values(parsedSearchFilters.selected)
            .flat()
            .filter(Boolean);
          
          if (selectedFilters.length > 0) {
            filteredListings = filteredListings.filter(listing => {
              if (!listing.filters?.subsections) return false;
              
              const listingFilters = [];
              listing.filters.subsections.forEach(subsection => {
                if (subsection.filters) {
                  listingFilters.push(...subsection.filters.map(f => f.name));
                }
                if (subsection.subsubsections) {
                  subsection.subsubsections.forEach(subsubsection => {
                    if (subsubsection.filters) {
                      listingFilters.push(...subsubsection.filters.map(f => f.name));
                    }
                  });
                }
              });
              
              return selectedFilters.some(filter => listingFilters.includes(filter));
            });
          }
        }
      } catch (error) {
        console.error("Error applying search filters:", error);
      }
    }

    // Calculate pagination
    const totalCount = filteredListings.length;
    const startIndex = parseInt(skip);
    const paginatedListings = filteredListings.slice(startIndex, startIndex + parseInt(limit));
    const totalPages = Math.ceil(totalCount / parseInt(limit)) || 1;
    const hasMore = startIndex + parseInt(limit) < totalCount;

    console.log(`Returning ${paginatedListings.length} listings out of ${totalCount} total`);

    return {
      listings: paginatedListings,
      total: totalCount,
      page: parseInt(page),
      totalPages,
      hasMore
    };

  } catch (error) {
    console.error("Error in getStreamedListings:", error);
    return {
      listings: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    };
  }
};


// -----------------> my code <---------------------
// exports.getStreamedListingsFallback = async (params) => {
//   const {
//     limit = 12,
//     skip = 0,
//     page = 1,
//     filters = {},
//     location = null,
//     radius = 50,
//     sort = { createdAt: -1 }
//   } = params;

//   try {
//     const userCoordinates = [location?.lng, location?.lat];
//     const searchRadius = parseFloat(radius) * 1000;

//     // Start building query
//     let query = { status: "active" };

//     // Geo filter
//     if (location && location.lat && location.lng) {
//       query["location.coordinates"] = {
//         $nearSphere: {
//           $geometry: {
//             type: "Point",
//             coordinates: userCoordinates
//           },
//           $maxDistance: searchRadius
//         }
//       };
//     }

//     // Price filters
//     // const priceQuery = {};
//     // if (filters.priceRange?.min) priceQuery.$gte = parseInt(filters.priceRange.min);
//     // if (filters.priceRange?.max) priceQuery.$lte = parseInt(filters.priceRange.max);
//     // if (filters.ranges?.price?.min) priceQuery.$gte = parseInt(filters.ranges.price.min);
//     // if (filters.ranges?.price?.max) priceQuery.$lte = parseInt(filters.ranges.price.max);
//     // if (Object.keys(priceQuery).length) query["pricePerNight.price"] = priceQuery;

//     // // Pet filter
//     // if (filters.dogCount) {
//     //   query["petsAllowed"] = true;
//     //   query["capacity.pets"] = { $exists: true };
//     // }

//     // Guest capacity
//     // if (filters.guestCount) {
//     //   query["capacity.people"] = { $gte: parseInt(filters.guestCount) };
//     // }

//     // if (filters.ranges?.people?.min > 1) {
//     //   query["capacity.people"] = { $gte: filters.ranges.people.min };
//     // }

//     // if (filters.ranges?.rooms?.min > 1) {
//     //   query["rooms"] = { $gte: filters.ranges.rooms.min };
//     // }

//     // if (filters.ranges?.bathrooms?.min > 1) {
//     //   query["bathrooms"] = { $gte: filters.ranges.bathrooms.min };
//     // }

//     // Amenities filter using $or
//     // if (filters.amenities?.length > 0) {
//     //   query.$or = [
//     //     { "filters.subsections.filters.name": { $in: filters.amenities } },
//     //     { "filters.subsections.subsubsections.filters.name": { $in: filters.amenities } }
//     //   ];
//     // }

//     // Query listings from DB (pagination + lean + populate)
//     const allMatchingListings = await Listing.find({
//   "location.coordinates": {
//     $nearSphere: {
//       $geometry: {
//         type: "Point",
//         coordinates: [9.5584214, 46.7276077]
//       },
//       $maxDistance: 50000
//     }
//   }
// }
//     )
//       // .sort(sort)
//       // .skip(skip)
//       // .limit(10)
//       // .populate("owner", "firstName lastName avatar")
//       // .lean();

//     console.log(`Returned ${allMatchingListings.length} listings from DB`);

//     // // Enrich with distance info
//     // const enrichedListings = (location?.lat && location?.lng)
//     //   ? allMatchingListings.map(listing => addDistanceInfo(listing, location))
//     //   : allMatchingListings.map(listing => ({
//     //       ...listing,
//     //       distance: Number.MAX_SAFE_INTEGER,
//     //       distanceInfo: {
//     //         distanceMeters: -1,
//     //         distanceKm: -1,
//     //         distanceText: "Distance unknown"
//     //       }
//     //     }));

//     // // Apply selected filters in-memory (cannot push to Mongo easily)
//     // let finalListings = enrichedListings;

//     // if (filters.selected) {
//     //   const selectedFilters = Object.values(filters.selected)
//     //     .flat()
//     //     .filter(Boolean);

//     //   if (selectedFilters.length) {
//     //     finalListings = finalListings.filter(listing => {
//     //       const listingFilters = [];

//     //       for (const subsection of listing.filters?.subsections || []) {
//     //         if (subsection.filters) {
//     //           listingFilters.push(...subsection.filters.map(f => f.name));
//     //         }
//     //         for (const subsub of subsection.subsubsections || []) {
//     //           if (subsub.filters) {
//     //             listingFilters.push(...subsub.filters.map(f => f.name));
//     //           }
//     //         }
//     //       }

//     //       return selectedFilters.some(sel => listingFilters.includes(sel));
//     //     });
//     //   }
//     // }

//     // // Optional: Interhome price calculation
//     // if (typeof fetchInterhomePrices === "function") {
//     //   const checkInDate = filters.dateRange?.start ? formatDate(filters.dateRange.start) : null;

//     //   if (checkInDate) {
//     //     const interhomeListings = finalListings.filter(l => l.provider === "Interhome" && l.Code);

//     //     if (interhomeListings.length) {
//     //       await Promise.allSettled(interhomeListings.map(listing =>
//     //         enrichInterhomePrice(listing, checkInDate, finalListings)
//     //       ));
//     //     }
//     //   }
//     // }

//     // const totalFilteredListings = allMatchingListings.length;
//     // const totalPages = Math.ceil(totalFilteredListings / parseInt(limit)) || 1;
//     // const hasMore = skip + limit < totalFilteredListings;

//     return {
//       listings: allMatchingListings,
//       // total: totalFilteredListings,
//       // page: parseInt(page),
//       // totalPages,
//       // hasMore
//     };
//   } catch (error) {
//     console.error("Error in getStreamedListingsFallback:", error);
//     return {
//       listings: [],
//       total: 0,
//       page: 1,
//       totalPages: 0,
//       hasMore: false
//     };
//   }
// }

// Calculates and attaches distance info
function addDistanceInfo(listing, location) {
  const [lng, lat] = listing.location?.coordinates || [0, 0];
  const distance = calculateDistance(location.lat, location.lng, lat, lng);
  const distanceKm = Math.round(distance / 100) / 10;

  return {
    ...listing,
    distance,
    distanceInfo: {
      distanceMeters: distance,
      distanceKm,
      distanceText: `${distanceKm} km away`
    }
  };
}

// Async function to enrich Interhome prices
async function enrichInterhomePrice(listing, checkInDate, allListings) {
  try {
    const priceData = await fetchInterhomePrices({
      accommodationCode: listing.Code,
      checkInDate,
      los: true
    });

    if (priceData?.priceList?.prices?.price?.length > 0) {
      const duration7Options = priceData.priceList.prices.price
        .filter(option => option.duration === 7)
        .sort((a, b) => a.paxUpTo - b.paxUpTo);

      if (duration7Options.length > 0) {
        const selectedOption = duration7Options[0];
        const calculatedPricePerNight = Math.round(selectedOption.price / 7);

        Object.assign(listing, {
          interhomePriceData: priceData,
          pricePerNight: {
            price: calculatedPricePerNight,
            currency: priceData.priceList.currency || 'CHF',
            totalPrice: selectedOption.price,
            duration: 7,
            paxUpTo: selectedOption.paxUpTo,
          }
        });
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch Interhome prices for listing ${listing._id}:`, error);
  }
}
/**
 * Format a date for API calls
 * @param {string|Date} dateStr - Date to format
 * @returns {string|null} Formatted date as YYYY-MM-DD or null
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Haversine formula to calculate distance between two points in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude from degrees to radians
  const toRadians = (degrees) => degrees * Math.PI / 180;
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Earth's radius in meters
  const R = 6371000;
  
  // Calculate distance in meters
  return R * c;
}

/**
 * Get a single listing by ID
 * Optimized for individual fetching with selective population
 * 
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing data
 */
exports.getSingleListing = async (id) => {
  try {
    return await Listing.findById(id)
      .populate("owner")
      .lean();
  } catch (error) {
    console.error(`Error fetching single listing ${id}:`, error);
    throw error;
  }
};

/**
 * Get multiple listings by IDs
 * For efficient batch loading
 * 
 * @param {Array<string>} ids - Array of listing IDs
 * @returns {Promise<Array<Object>>} Array of listings
 */
exports.getListingsByIds = async (ids) => {
  try {
    return await Listing.find({ _id: { $in: ids } })
      .populate("owner")
      .lean();
  } catch (error) {
    console.error("Error fetching listings by IDs:", error);
    throw error;
  }
};

// Keep existing methods
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