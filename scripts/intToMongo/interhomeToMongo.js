// interhomeToMongo.js
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ───────── API Endpoints ─────────
const BASE = 'https://ws.interhome.com/ih/b2b/V0100';
const LIST_URL        = `${BASE}/accommodation/list`;
const DETAIL_URL      = code => `${BASE}/accommodation/${encodeURIComponent(code)}`;
const MEDIA_URL       = code => `${BASE}/accommodation/media/${encodeURIComponent(code)}`;
const PRICELIST_URL   = code => `${BASE}/accommodation/pricelistalldur/${encodeURIComponent(code)}`;

// ───────── Your API Credentials ─────────
const HEADERS = {
  "PartnerId": "CH1002557",
  "Token":     "XD1mZXqcC6",
  "Accept":    "application/json"
};

// ───────── MongoDB Setup ─────────
const MONGO_URI = process.env.MONGO_URI 
  || 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenInterhomeDB?retryWrites=true&w=majority';

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
const Listing = require('../../models/listing.model'); // <-- adjust path if needed

// ───────── Fetch Functions ─────────
async function fetchList() {
  try {
    console.log('Fetching accommodation list from Interhome API...');
    const res = await axios.get(LIST_URL, { headers: HEADERS });
    console.log('API Response status:', res.status);
    
    // Log the structure of the response
    console.log('Response data keys:', Object.keys(res.data));
    
    // Fix: Use lowercase 'accommodationItem' instead of 'AccommodationItem'
    const items = res.data.accommodationItem || [];
    console.log(`Found ${items.length} items in the response`);
    
    // Log the first item to see its structure
    if (items.length > 0) {
      console.log('First item structure:', JSON.stringify(items[0], null, 2));
    }
    
    // Return all items for testing, or limit to 5 for production
    return items.slice(0, 5);
  } catch (error) {
    console.error('Error fetching list:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

async function fetchDetail(code) {
  try {
    const res = await axios.get(DETAIL_URL(code), { headers: HEADERS });
    console.log(`Detail response keys: ${Object.keys(res.data)}`);
    // Check for both capitalized and lowercase keys
    return res.data.Accommodation || res.data.accommodation || null;
  } catch (error) {
    console.error(`Error fetching details for ${code}:`, error.message);
    return null;
  }
}

async function fetchMedia(code) {
  try {
    const res = await axios.get(MEDIA_URL(code), { headers: HEADERS });
    console.log(`Media response keys: ${Object.keys(res.data)}`);
    // Check for both capitalized and lowercase keys
    const mediaItems = res.data.MediaItems?.MediaItem || 
                      res.data.mediaItems?.mediaItem ||
                      res.data.mediaitems?.mediaitem || [];
    return mediaItems;
  } catch (error) {
    console.error(`Error fetching media for ${code}:`, error.message);
    return [];
  }
}

async function fetchPriceList(code) {
  try {
    const res = await axios.get(PRICELIST_URL(code), { headers: HEADERS });
    console.log(`Price list response keys: ${Object.keys(res.data)}`);
    // Check for both capitalized and lowercase keys
    return res.data.PriceList || res.data.pricelist || res.data.priceList || null;
  } catch (error) {
    console.error(`Error fetching price list for ${code}:`, error.message);
    return null;
  }
}

// ───────── Mapping Function ─────────
function mapToListing(detail, mediaItems, priceList) {
  // Log the structure to debug
  console.log('Detail structure:', Object.keys(detail));
  
  // Handle different property name cases
  const code = detail.Code || detail.code;
  const name = detail.Name || detail.name;
  const type = detail.Type || detail.type;
  
  // Get descriptions with fallbacks for different property names
  const descriptions = detail.Descriptions || detail.descriptions;
  const description = descriptions?.Description || descriptions?.description;
  const desc = description?.[0]?.Value || description?.[0]?.value || '';

  // Handle price data with different property names
  const prices = priceList?.Prices || priceList?.prices;
  const priceArray = prices?.Price || prices?.price;
  const priceEntry = priceArray?.[0] || {};
  
  const duration = priceEntry.Duration || priceEntry.duration;
  const price = priceEntry.Price || priceEntry.price;
  
  const perNight = duration && price ? price / duration : 0;
  const currency = priceList?.Currency || priceList?.currency || 'EUR';

  // Handle location data
  const place = detail.Place || detail.place;
  const address = detail.Address || detail.address;
  
  return {
    Code: code,
    listingType: type || '',
    title: name,
    description: desc,
    checkInTime: null,
    checkOutTime: null,
    location: {
      address: place?.[0]?.Content || place?.[0]?.content || '',
      optional: '',
      type: 'Point',
      coordinates: [
        address?.Longitude || address?.longitude || 0,
        address?.Latitude || address?.latitude || 0
      ]
    },
    pricePerNight: {
      price: perNight,
      currency: currency
    },
    specialPrices: [],
    additionalServices: [],
    availability: [],
    status: 'active',
    legal: {
      cancellationPolicy: '',
      termsAndConditions: ''
    },
    source: {
      name: 'interhome',
      redirectLink: DETAIL_URL(code)
    },
    images: mediaItems.map(m => m.Uri || m.uri),
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
  console.log('Fetching accommodation list...');
  const listItems = await fetchList();
  console.log(`Retrieved ${listItems.length} items from API`);

  if (listItems.length === 0) {
    console.warn('⚠️ No items found in the API response. Check API credentials and endpoint.');
    mongoose.disconnect();
    return;
  }

  const listings = [];
  for (const item of listItems) {
    // Use lowercase property names (code instead of Code, name instead of Name)
    const code = item.code || item.Code;
    const name = item.name || item.Name;
    
    console.log(`🚀 Processing ${code} – ${name || 'Unknown'}`);
    
    if (!code) {
      console.warn('⚠️ Item has no code, skipping:', JSON.stringify(item, null, 2));
      continue;
    }
    
    try {
      const [detail, media, priceList] = await Promise.all([
        fetchDetail(code),
        fetchMedia(code),
        fetchPriceList(code)
      ]);
      if (!detail) {
        console.warn(`⚠️ No details for ${code}, skipping`);
        continue;
      }
      listings.push(mapToListing(detail, media, priceList));
    } catch (error) {
      console.error(`Error processing item ${code}:`, error.message);
    }
  }

  console.log(`Processed ${listings.length} listings successfully`);

  // 1) Save to MongoDB
  try {
    if (listings.length > 0) {
      await Listing.insertMany(listings);
      console.log('✅ Saved to MongoDB:', listings.length, 'listings');
    } else {
      console.warn('⚠️ No listings to save to MongoDB');
    }
  } catch (err) {
    console.error('❌ Error saving to MongoDB:', err.message);
    console.error('Stack trace:', err.stack);
  }

  // 2) Save to local JSON file
  const outPath = path.join(__dirname, 'listings.json');
  fs.writeFileSync(outPath, JSON.stringify(listings, null, 2));
  console.log('✅ Saved to file:', outPath);

  mongoose.disconnect();
}

main().catch(err => console.error(err));
