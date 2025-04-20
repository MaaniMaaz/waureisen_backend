// importInterhomeToMongo.js - Imports Interhome listings from JSON file to MongoDB
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ───────── MongoDB Setup ─────────
const MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenInterhomeDBLatest?retryWrites=true&w=majority&appName=ClusterWork';

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
const inputFilePath = path.join(__dirname, 'interhome_listings_with_code.json');

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
function mapToListing(sharetribeListing, detail, mediaItems) {
  // Extract data from Sharetribe listing
  const publicData = JSON.parse(sharetribeListing.PublicData || '{}');
  
  // Extract data from Interhome API detail
  const code = detail?.code || detail?.Code || '';
  const name = detail?.name || detail?.Name || '';
  const type = detail?.type || detail?.Type || '';
  
  // Get descriptions
  const descriptions = detail?.descriptions?.description || 
                      detail?.Descriptions?.Description || [];
  const descriptionObj = descriptions.find(d => d.Type === 'outside' || d.type === 'outside') || 
                        descriptions[0] || {};
  const desc = descriptionObj?.Value || descriptionObj?.value || '';

  // Get coordinates
  const address = detail?.address || detail?.Address || {};
  const longitude = address?.longitude || address?.Longitude || 0;
  const latitude = address?.latitude || address?.Latitude || 0;
  
  // Get place information
  const place = detail?.place || detail?.Place || [];
  const placeContent = place[0]?.content || place[0]?.Content || '';
  
  // Extract amenities from attributes
  const attributes = detail?.attributes?.attribute || 
                    detail?.Attributes?.Attribute || [];
  const amenities = attributes.map(attr => attr.name || attr.Name).filter(Boolean);
  
  // Extract images from media items - handle all possible property names
  const images = mediaItems.map(item => {
    const uri = item.uri || item.Uri || '';
    if (uri) {
      console.log(`Found image URI: ${uri}`);
    }
    return uri;
  }).filter(Boolean);
  
  console.log(`Mapped ${images.length} images for listing ${code}`);
  
  // Make sure additionalServices is an array, not ObjectIds
  let additionalServices = [];
  if (publicData.additionalServices) {
    try {
      // If it's a string, try to parse it
      if (typeof publicData.additionalServices === 'string') {
        additionalServices = JSON.parse(publicData.additionalServices);
      } else if (Array.isArray(publicData.additionalServices)) {
        // If it's already an array, use it directly but ensure it's not ObjectIds
        additionalServices = publicData.additionalServices.map(service => {
          if (typeof service === 'object' && service !== null) {
            return service;
          }
          return {}; // Return empty object for invalid services
        });
      }
    } catch (e) {
      console.error(`Error parsing additionalServices: ${e.message}`);
      additionalServices = [];
    }
  }
  
  return {
    Code: code,
    listingType: publicData.listingType || 'interhomeaccommocation',
    title: sharetribeListing.Title || name,
    description: desc,
    checkInTime: publicData.detailsCheckInTime || null,
    checkOutTime: publicData.detailsCheckOutTime || null,
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
    amenities: amenities,
    provider: 'Interhome',
    selectedFilters: {},
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
      await Listing.insertMany(processedListings);
      console.log('✅ Successfully saved to MongoDB');
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