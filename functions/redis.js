const Redis = require("ioredis");
const axios = require("axios");
const moment = require("moment");
const Listing = require("../models/listing.model");

const redis = new Redis();
const BATCH_SIZE = 500;
const REDIS_KEY = "listings";
const LOCK_KEY = "listings_lock";

// 🔄 Delete existing Redis list
const deleteRedisList = async () => {
  await redis.del(REDIS_KEY);
  console.log(`🗑️ Deleted existing Redis key: ${REDIS_KEY}`);
};



const storeListingInRedis = async () => {
  const PROGRESS_KEY = "listing:progress"; // Redis key to track progress
  const LOCK_KEY = "listing:lock";         // Redis lock key

  // Check if already locked
  const isLocked = await redis.get(LOCK_KEY);
  if (isLocked) {
    console.log("🚫 Redis update already in progress. Skipping...");
    return;
  }

  // Set lock with expiration
  await redis.set(LOCK_KEY, "1", "EX", 300); // Lock for 5 mins

  try {
    const total = await Listing.countDocuments();
    const totalPages = Math.ceil(total / BATCH_SIZE);
    const savedPage = parseInt(await redis.get(PROGRESS_KEY)) || 0;

    console.log(`📦 Total Listings: ${total}, Pages: ${totalPages}`);
    console.log(`▶️ Resuming from page: ${savedPage + 1}`);

    // Process each page
    for (let page = savedPage; page < totalPages; page++) {
      const listings = await Listing.find()
        .populate("owner filters")
        .skip(page * BATCH_SIZE)  // Fixed: use page variable
        .limit(BATCH_SIZE);

      const processedListings = await Promise.all(
        listings.map(async (item) => {
          let price = item?.price || 0;
          let dates = item?.dates || [];
          
          if (item?.source?.name === "interhome") {
            // Retry logic for API calls
            let retries = 0;
            let success = false;
            
            while (retries < 3 && !success) {
              try {
                const response = await getListingAvailableDates(item?.Code);
                // Only update if response has valid data
                if (response?.dates !== undefined) {
                  dates = response.dates;
                }
                if (response?.price !== undefined) {
                  price = response.price;
                }
                success = true;
                console.log(`✅ API success for ${item._id} on attempt ${retries + 1}`);
              } catch (err) {
                retries++;
                console.warn(`⚠️ Retry ${retries}/3 for ${item._id} failed:`, err.message || err);
                
                // Add exponential backoff delay
                if (retries < 3) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
                }
              }
            }
            
            if (!success) {
              console.warn(`❌ Failed after 3 retries for ${item._id}. Using previous values - price: ${price}, dates: ${dates.length} entries`);
              // Keep the original values that were set at the beginning
            }
          } else {
            // For non-interhome sources
            price =(item?.pricePerNight?.isDiscountActivate ? item?.pricePerNight?.discount : item?.pricePerNight?.price) || 0;
            dates = item?.dates || [];
          }

          try {
            const updated = await Listing.findByIdAndUpdate(
              item._id,
              { $set: { price, dates } },
              { new: true }
            );

            if (updated) {
              console.log(`✅ Updated: ${item._id} - Price: ${price}, Dates: ${dates.length}`);
            }
            return updated;
          } catch (dbError) {
            console.error(`❌ Database update failed for ${item._id}:`, dbError.message);
            return null;
          }
        })
      );

      const successCount = processedListings.filter(item => item !== null).length;
      console.log(`✅ Processed ${successCount}/${listings.length} listings on page ${page + 1}/${totalPages}`);

      // Save progress after successful page processing
      await redis.set(PROGRESS_KEY, page + 1);
    }

    // Reset progress when completely done
    await redis.del(PROGRESS_KEY);
    console.log("🎉 All listings updated successfully.");
    
  } catch (err) {
    console.error("❌ Error in storeListingInRedis:", err.message || err);
    throw err; // Re-throw to let caller handle if needed
  } finally {
    // Always release lock
    await redis.del(LOCK_KEY);
  }
};


// 📤 Retrieve all stored listings from Redis
const getStoredListings = async () => {
  try {
    const total = await redis.llen(REDIS_KEY);
    if (total === 0) return [];

    const raw = await redis.lrange(REDIS_KEY, 0, total);
    // const getted = await redis/get(REDIS_KEY)
    // console.log(raw );
    
    return raw.map(item => JSON.parse(item));
  } catch (err) {
    console.error("❌ Error fetching listings from Redis:", err.message || err);
    return [];
  }
};

// 💰 Fetch listing price from Interhome API
const getListingPrices = async (data) => {
  try {

    console.log(data , "price data");
    const response = await axios.post(
      `http://192.168.2.104:5002/api/interhome/accommodation/price`,data
     
    );
console.log(response?.data);

  

    return response?.data?.data?.price?.regularRentalPrice;
  } catch (err) {
    console.error("❌ Error in getListingPrices:", err.message || err);
    return 0;
  }
};

// 📅 Fetch listing availability dates from your backend
const getListingAvailableDates = async (accommodationCode) => {
  try {
    const response = await axios.get(
      `http://192.168.2.104:5002/api/interhome/vacancies/${accommodationCode}`
    );

    const availableDates = response?.data?.data?.calendar?.day || [];
const filtered = availableDates
      .filter(
        (item) =>
          item?.state === "Y" &&
          item?.allotment > 0 &&
          item?.change !== "X"
      )

    const result = filtered
      .map((item) => item?.date);

//  price call start
  const lastDateObj = filtered?.[filtered.length - 15];
let startDateFormatted ;
let endDateFormatted ;
if (lastDateObj) {
  const endDate = lastDateObj?.date;

  const startDateObj = new Date(endDate);
  startDateObj.setDate(startDateObj.getDate() - lastDateObj?.minimumStay);

   startDateFormatted = startDateObj.toISOString().split("T")[0];
   endDateFormatted = new Date(endDate).toISOString().split("T")[0];

  console.log("Start Date:", startDateFormatted);
  console.log("End Date:", endDateFormatted);
}
 const data = {
      BookingHeader: {
        SalesOffice: "0505",
        AccommodationCode: accommodationCode,
        Adults: 1,
        CheckIn:  startDateFormatted,
        CheckOut: 
           endDateFormatted,
        Language: "EN",
        Currency: "CHF",
      },
    };

    const price =  await getListingPrices(data) / lastDateObj?.minimumStay

console.log( result,price ,"result dates hai k nahi");
//  price call end
      return {price:price,dates:result}

  } catch (err) {
    console.error("❌ Error in getListingAvailableDates:", err.message || err);
    return [];
  }
};


// 📅 Fetch listing availability dates from your backend
const updateListing = async (id , payload) => {
  try {
    const response = await axios.get(
      `https://waureisen-backend-rhp1.onrender.com/api/listings/${id}`,
      payload
    );

    return response?.data;
  } catch (err) {
    console.error("❌ Error in getListingAvailableDates:", err.message || err);
    return [];
  }
};

module.exports = {
  storeListingInRedis,
  getStoredListings,
};
