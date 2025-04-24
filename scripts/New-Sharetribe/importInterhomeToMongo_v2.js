// importInterhomeToMongo.js - Imports Interhome listings from JSON file to MongoDB
// In this script the details from JSON file for maxDogs, checkInTime, checkOutTime, beds, washrooms, selectedFilters.dogFilters, legal.termsAndConditions
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ───────── MongoDB Setup ─────────
const MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenInterhomeCHECK?retryWrites=true&w=majority&appName=ClusterWork';

// ───────── API Endpoints ─────────
const API_BASE = 'https://ws.interhome.com/ih/b2b/V0100';
const DETAIL_URL = code => `${API_BASE}/accommodation/${encodeURIComponent(code)}`;
const MEDIA_URL = code => `${API_BASE}/accommodation/media/${encodeURIComponent(code)}`;

// ───────── API Credentials ─────────
const HEADERS = {
  "PartnerId": "CH1002557",
  "Token": "XD1mZXqcC6",
  "Accept": "application/json"  // This was missing in your new script
};

// ───────── Input File Path ─────────
const inputFilePath = path.join(__dirname, 'interhome_listings_parsed.json');

// ───────── Connect to MongoDB ─────────
const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// ───────── Load Listing Model ─────────
const Listing = require('../../models/listing.model');

// ───────── Fetch Functions ─────────
async function fetchDetail(code) {
  try {
    console.log(`Fetching details for ${code} with URL: ${DETAIL_URL(code)}`);
    const res = await axios.get(DETAIL_URL(code), { 
      headers: HEADERS,
      validateStatus: status => status < 500 // Accept any status code less than 500
    });
    
    // Enhanced logging to debug the response
    console.log(`Response status: ${res.status}`);
    console.log(`Response data keys:`, Object.keys(res.data));
    console.log(`Response has Accommodation: ${!!res.data.Accommodation}`);
    
    // Log the first 500 characters of the response for inspection
    console.log(`Response preview:`, JSON.stringify(res.data).substring(0, 500) + '...');
    
    if (res.data.Error) {
      console.error(`API Error: ${res.data.Error.Message} (${res.data.Error.Status})`);
    }
    
    // Try both capitalized and lowercase keys
    const accommodation = res.data.Accommodation || res.data.accommodation || null;
    
    if (!accommodation) {
      console.warn(`No accommodation data found in response for ${code}`);
    }
    
    return accommodation;
  } catch (error) {
    console.error(`Error fetching details for ${code}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Headers:`, error.response.headers);
      console.error(`Data:`, error.response.data);
    }
    return null;
  }
}

// Update the fetchMedia function to handle the nested structure
async function fetchMedia(code) {
  try {
    console.log(`Fetching media for ${code}`);
    const res = await axios.get(MEDIA_URL(code), { 
      headers: HEADERS,
      validateStatus: status => status < 500 // Accept any status code less than 500
    });
    
    // Enhanced debugging for media response
    console.log(`Media response status: ${res.status}`);
    console.log(`Media response data keys:`, Object.keys(res.data));
    
    if (res.data.Error) {
      console.error(`API Error: ${res.data.Error.Message} (${res.data.Error.Status})`);
    }
    
    // Handle the nested structure - check all possible paths
    let mediaItems = [];
    
    if (res.data.MediaItems?.MediaItem) {
      mediaItems = res.data.MediaItems.MediaItem;
    } else if (res.data.mediaItems?.mediaItem) {
      mediaItems = res.data.mediaItems.mediaItem;
    } else if (res.data.mediaItems?.MediaItem) {
      mediaItems = res.data.mediaItems.MediaItem;
    } else if (res.data.MediaItems?.mediaItem) {
      mediaItems = res.data.MediaItems.mediaItem;
    } else if (Array.isArray(res.data.mediaItem)) {
      mediaItems = res.data.mediaItem;
    } else if (Array.isArray(res.data.MediaItem)) {
      mediaItems = res.data.MediaItem;
    }
    
    console.log(`Found ${mediaItems.length} media items`);
    if (mediaItems.length > 0) {
      console.log(`First media item URI:`, mediaItems[0].uri || mediaItems[0].Uri || 'No URI found');
    }
    
    return mediaItems;
  } catch (error) {
    console.error(`Error fetching media for ${code}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
    return [];
  }
}

// Update the mapToListing function to properly handle images and additionalServices
// Update the mapToListing function to properly handle all fields
function mapToListing(sharetribeListing, detail, mediaItems) {
  // Extract data from Sharetribe listing
  // Handle both cases: when PublicData is already parsed or when it's a string that needs parsing
  let publicData = {};
  
  if (typeof sharetribeListing.PublicData === 'string') {
    try {
      publicData = JSON.parse(sharetribeListing.PublicData || '{}');
    } catch (error) {
      console.warn(`Failed to parse PublicData for ${sharetribeListing.Code}: ${error.message}`);
    }
  } else if (sharetribeListing.PublicData) {
    // If it's already an object (not a string), use it directly
    publicData = sharetribeListing.PublicData;
  }
  
  // If we have direct properties on the listing object (from parsed JSON), use those as well
  Object.keys(sharetribeListing).forEach(key => {
    if (key.startsWith('facilities') || key === 'dogFacilities') {
      publicData[key] = sharetribeListing[key];
    }
  });
  
  // Extract data from Interhome API detail
  const code = detail?.code || detail?.Code || '';
  const name = detail?.name || detail?.Name || '';
  const type = detail?.type || detail?.Type || '';
  
  // Get country information
  const countryCode = detail?.countryCode || detail?.CountryCode || '';
  const country = detail?.country?.[0]?.content || 
                 detail?.Country?.[0]?.content || '';
  
  // Get room information - fix the mapping to match the schema
  const rooms = detail?.rooms?.number || detail?.Rooms?.number || 0;
  const bedRooms = detail?.bedRooms?.number || detail?.BedRooms?.number || 0;
  const bathRooms = detail?.bathRooms?.number || detail?.BathRooms?.number || 0;
  const toilets = detail?.toilets?.number || detail?.Toilets?.number || 0;
  
  // Get descriptions - separate inside and outside descriptions
  const descriptions = detail?.descriptions?.description || 
                      detail?.Descriptions?.Description || [];
  
  let insideDescription = '';
  let outsideDescription = '';
  
  descriptions.forEach(desc => {
    const type = desc.type || desc.Type || '';
    const value = desc.value || desc.Value || '';
    
    if (type.toLowerCase() === 'inside') {
      insideDescription = value;
    } else if (type.toLowerCase() === 'outside') {
      outsideDescription = value;
    }
  });
  
  // Combine descriptions for general use
  const generalDescription = outsideDescription + (outsideDescription && insideDescription ? ' ' : '') + insideDescription;

  // Get coordinates
  const address = detail?.address || detail?.Address || {};
  const longitude = address?.longitude || address?.Longitude || 0;
  const latitude = address?.latitude || address?.Latitude || 0;
  
  // Get place information
  const place = detail?.place || detail?.Place || [];
  const placeContent = place[0]?.content || place[0]?.Content || '';
  
  // Extract attributes from API response
  // Commenting out API attributes as requested - we will only use JSON attributes
  // const apiAttributes = detail?.attributes?.attribute || 
  //                   detail?.Attributes?.Attribute || [];
  // const apiMappedAttributes = apiAttributes.map(attr => ({
  //   name: attr.name || attr.Name || '',
  //   description: []
  // })).filter(attr => attr.name);
  
  // Extract all facilities from publicData and map them to attributes format
  // Create a map to group facilities by name
  const facilitiesMap = new Map();
  
  // Find all keys that start with 'facilities' in publicData
  Object.keys(publicData).forEach(key => {
    if (key.startsWith('facilities')) {
      const facilityCategory = key;
      const facilityValues = publicData[key];
      
      // Only process array values
      if (Array.isArray(facilityValues)) {
        // Get or create the attribute entry for this facility category
        if (!facilitiesMap.has(facilityCategory)) {
          facilitiesMap.set(facilityCategory, {
            name: facilityCategory,
            description: []
          });
        }
        
        // Add all values to the description array
        const facilityAttribute = facilitiesMap.get(facilityCategory);
        facilityValues.forEach(value => {
          facilityAttribute.description.push(value);
        });
        
        console.log(`Mapped ${facilityValues.length} items from ${facilityCategory}`);
      } else if (typeof facilityValues === 'string') {
        // Handle case where the facility is a string
        if (!facilitiesMap.has(facilityCategory)) {
          facilitiesMap.set(facilityCategory, {
            name: facilityCategory,
            description: []
          });
        }
        
        const facilityAttribute = facilitiesMap.get(facilityCategory);
        facilityAttribute.description.push(facilityValues);
        
        console.log(`Mapped string value from ${facilityCategory}`);
      }
    }
  });
  
  // Process dog facilities and add to attributes
  const dogFacilities = publicData.dogFacilities || [];
  if (dogFacilities.length > 0) {
    if (!facilitiesMap.has('dogFacilities')) {
      facilitiesMap.set('dogFacilities', {
        name: 'dogFacilities',
        description: []
      });
    }
    
    const dogFacilityAttribute = facilitiesMap.get('dogFacilities');
    dogFacilities.forEach(facility => {
      dogFacilityAttribute.description.push(facility);
    });
    
    console.log(`Added ${dogFacilities.length} dog facilities to attributes`);
  }
  
  // Convert the map values to an array
  const mappedAttributes = Array.from(facilitiesMap.values());
  
  console.log(`Mapped total of ${mappedAttributes.length} attributes for listing ${code}`);
  
  // Extract images from media items - handle all possible property names
  const images = mediaItems.map(item => {
    const uri = item.uri || item.Uri || '';
    if (uri) {
      console.log(`Found image URI: ${uri}`);
    }
    return uri;
  }).filter(Boolean);
  
  console.log(`Mapped ${images.length} images for listing ${code}`);
  
  // Create room details if available
  const roomDetails = [];
  if (detail?.rooms?.room) {
    detail.rooms.room.forEach(room => {
      roomDetails.push({
        floor: room.floor || '',
        type: room.type || '',
        count: room.count || 1
      });
    });
  }
  
  // Process dog facilities for dog filters
  // Reuse the previously declared dogFacilities variable instead of redeclaring it
  const dogFilters = (publicData.dogFacilities || []).map(facility => ({
    name: facility,
    icon: ''
  }));
  
  // Parse check-in and check-out times to Date objects if they exist
  let checkInTime = null;
  let checkOutTime = null;
  
  if (publicData.detailsCheckInTime) {
    try {
      checkInTime = new Date(publicData.detailsCheckInTime);
    } catch (error) {
      console.warn(`Failed to parse check-in time for ${code}: ${error.message}`);
    }
  }
  
  if (publicData.detailsCheckOutTime) {
    try {
      checkOutTime = new Date(publicData.detailsCheckOutTime);
    } catch (error) {
      console.warn(`Failed to parse check-out time for ${code}: ${error.message}`);
    }
  }
  
  return {
    Code: code,
    listingType: publicData.listingType || 'interhomeaccommocation',
    title: sharetribeListing.Title || name,
    description: {
      general: generalDescription,
      inside: insideDescription,
      outside: outsideDescription
    },
    checkInTime: checkInTime,
    checkOutTime: checkOutTime,
    location: {
      address: placeContent || publicData.location?.address || '',
      optional: '',
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    pricePerNight: {
      price: 0,
      currency: 'CHF'
    },
    specialPrices: [],
    additionalServices: [], // Set to empty array to avoid ObjectId issues
    availability: [],
    // bedRooms should come from API detail call
    bedRooms: bedRooms,
    // beds should use detailsBeds from JSON file
    beds: publicData.detailsBeds || 0,
    rooms: {
      number: rooms,
      room: roomDetails
    },
    // Use detailsBathrooms from publicData if available, otherwise use bathRooms or toilets from API
    washrooms: publicData.detailsBathrooms || bathRooms || toilets || 0,
    // Use detailsMaxDogs from publicData if available
    maxDogs: publicData.detailsMaxDogs || 0,
    status: 'active',
    legal: {
      cancellationPolicy: publicData.documentPolicy || '',
      termsAndConditions: publicData.termandcondition || ''
    },
    source: {
      name: 'interhome',
      redirectLink: sharetribeListing.PriceOnRequestLink || publicData.priceOnRequest || ''
    },
    images: images,
    // Fix the attributes mapping to match the schema
    attributes: mappedAttributes,
    provider: 'Interhome',
    selectedFilters: {
      dogFilters: dogFilters
    },
    totalViews: 0,
    totalBookings: 0,
    totalReviews: 0,
    totalRating: 0,
    averageRating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// ───────── Main Process ─────────
async function main() {
  await connectMongo();
  
  try {
    // Read the input JSON file
    console.log('Reading input file...');
    const data = fs.readFileSync(inputFilePath, 'utf8');
    const listings = JSON.parse(data);
    
    console.log(`Found ${listings.length} listings in the JSON file`);
    
    // Process only the first 5 listings
    const listingsToProcess = listings.slice(0, 5);
    console.log(`Processing first ${listingsToProcess.length} listings...`);
    
    const processedListings = [];
    
    // Process each listing
    for (const [index, listing] of listingsToProcess.entries()) {
      const code = listing.Code;
      
      if (!code) {
        console.warn(`⚠️ Listing ${index + 1} has no code, skipping`);
        continue;
      }
      
      console.log(`🔄 Processing ${index + 1}/${listingsToProcess.length}: ${listing.Title} (${code})`);
      
      try {
        // Fetch additional data from Interhome API
        const [detail, mediaItems] = await Promise.all([
          fetchDetail(code),
          fetchMedia(code)
        ]);
        
        if (!detail) {
          console.warn(`⚠️ No details found for ${code}, skipping`);
          continue;
        }
        
        // Map the data to our listing model
        const mappedListing = mapToListing(listing, detail, mediaItems);
        processedListings.push(mappedListing);
        
        console.log(`✅ Successfully processed ${listing.Title}`);
      } catch (error) {
        console.error(`❌ Error processing listing ${code}:`, error.message);
      }
    }
    
    // Save to MongoDB
    if (processedListings.length > 0) {
      console.log(`Saving ${processedListings.length} listings to MongoDB...`);
      let savedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const listing of processedListings) {
        try {
          const result = await Listing.updateOne(
            { Code: listing.Code }, // filter by Code
            listing,                // replacement document
            { upsert: true }        // create if doesn't exist
          );
          
          if (result.upsertedCount > 0) {
            savedCount++;
          } else if (result.modifiedCount > 0) {
            updatedCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Error saving listing ${listing.Code}: ${error.message}`);
        }
      }
      
      console.log(`✅ Successfully saved ${savedCount} new listings and updated ${updatedCount} existing listings in MongoDB`);
      
      // Log any errors if they occurred
      if (errorCount > 0) {
        console.warn(`⚠️ Note: ${errorCount} listings could not be saved due to errors`);
      }
    } else {
      console.warn('⚠️ No listings to save');
    }
    
    // Save processed listings to a JSON file for reference
    const outputFilePath = path.join(__dirname, 'processed_listings.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(processedListings, null, 2));
    console.log(`✅ Saved processed listings to ${outputFilePath}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  mongoose.disconnect();
});