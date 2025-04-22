// interhomeToMongoFull.js - Imports ALL Interhome accommodations
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

// ───────── MongoDB Setup ───────── DB"2222222222222222222
const MONGO_URI = process.env.MONGO_URI 
  || 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenInterhomeDB2?retryWrites=true&w=majority';

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
const Listing = require('../../../models/listing.model'); // <-- adjust path if needed

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
    
    // Return only the first 1000 items
    return items.slice(0, 1000);
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
    // Add arrival and departure dates as required parameters
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    
    const fromDate = today.toISOString().split('T')[0];
    const toDate = nextYear.toISOString().split('T')[0];
    
    const url = `${PRICELIST_URL(code)}?fromDate=${fromDate}&toDate=${toDate}`;
    
    const res = await axios.get(url, { headers: HEADERS });
    // Check for both capitalized and lowercase keys
    return res.data.PriceList || res.data.pricelist || res.data.priceList || null;
  } catch (error) {
    console.error(`Error fetching price list for ${code}:`, error.message);
    return null;
  }
}

// ───────── Mapping Function ─────────
function mapToListing(detail, mediaItems, priceList) {
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
  
  // Extract amenities from attributes
  const attributes = detail.Attributes?.Attribute || 
                     detail.attributes?.attribute || [];
  
  const amenities = attributes.map(attr => 
    attr.Name || attr.name
  ).filter(Boolean);
  
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
  console.log('Fetching accommodation list...');
  const listItems = await fetchList();
  console.log(`Retrieved ${listItems.length} items from API (limited to 1000)`);

  if (listItems.length === 0) {
    console.warn('⚠️ No items found in the API response. Check API credentials and endpoint.');
    mongoose.disconnect();
    return;
  }

  // Process in batches to avoid memory issues
  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(listItems.length / BATCH_SIZE);
  
  console.log(`Processing ${listItems.length} items in ${totalBatches} batches of ${BATCH_SIZE}`);
  
  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;
  
  // Create a single array to hold all listings
  const allListings = [];
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, listItems.length);
    const batchItems = listItems.slice(start, end);
    
    console.log(`\n🔄 Processing batch ${batchIndex + 1}/${totalBatches} (items ${start+1}-${end})`);
    
    const batchListings = [];
    
    // Process each item in the batch
    for (const item of batchItems) {
      // Use lowercase property names (code instead of Code, name instead of Name)
      const code = item.code || item.Code;
      const name = item.name || item.Name;
      
      console.log(`🚀 Processing ${code} – ${name || 'Unknown'} (${++processedCount}/${listItems.length})`);
      
      if (!code) {
        console.warn('⚠️ Item has no code, skipping');
        failedCount++;
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
          failedCount++;
          continue;
        }
        
        const listing = mapToListing(detail, media, priceList);
        batchListings.push(listing);
        allListings.push(listing); // Add to the complete list
        successCount++;
      } catch (error) {
        console.error(`Error processing item ${code}:`, error.message);
        failedCount++;
      }
    }
    
    // Save batch to MongoDB
    if (batchListings.length > 0) {
      try {
        await Listing.insertMany(batchListings);
        console.log(`✅ Saved batch ${batchIndex + 1} to MongoDB: ${batchListings.length} listings`);
      } catch (err) {
        console.error(`❌ Error saving batch ${batchIndex + 1} to MongoDB:`, err.message);
      }
    } else {
      console.warn(`⚠️ No listings in batch ${batchIndex + 1} to save`);
    }
  }

  // Save all listings to a single JSON file
  if (allListings.length > 0) {
    const allListingsPath = path.join(__dirname, 'all_listings.json');
    fs.writeFileSync(allListingsPath, JSON.stringify(allListings, null, 2));
    console.log(`✅ Saved all ${allListings.length} listings to file: ${allListingsPath}`);
  }

  console.log(`\n✅ Import complete!`);
  console.log(`Total processed: ${processedCount}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed: ${failedCount}`);

  // Save summary to file
  const summaryPath = path.join(__dirname, 'import_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    totalProcessed: processedCount,
    successful: successCount,
    failed: failedCount,
    completedAt: new Date().toISOString()
  }, null, 2));
  console.log(`✅ Saved summary to: ${summaryPath}`);

  mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  mongoose.disconnect();
});