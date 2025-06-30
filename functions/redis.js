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

// 🧠 Store all listings in Redis with pagination
// const storeListingInRedis = async () => {
//   try {
//     await deleteRedisList();

//     const total = await Listing.countDocuments();
//     const totalPages = Math.ceil(total / BATCH_SIZE);

//     console.log(`📦 Total Listings: ${total}, Pages: ${totalPages}`);

//     for (let page = 0; page < totalPages; page++) {
//       const listings = await Listing.find()
//         .populate("owner filters")
//         .skip(page * BATCH_SIZE)
//         .limit(BATCH_SIZE);

//       const processedListings = await Promise.all(
//         listings.map(async (item) => {
//           let price = 0;
//           let dates = [];

//           if (item?.source?.name === "interhome") {
//             price = await getListingPrices(item?.Code, 2, true);
//             dates = await getListingAvailableDates(item?.Code);
//           } else {
//             price = item?.pricePerNight?.price || 0;
//           }

//           return {
//             ...item.toObject(),
//             price,
//             dates,
//           };
//         })
//       );

//       // Push each listing into Redis list
//       for (const listing of processedListings) {
//         await redis.rpush(REDIS_KEY, JSON.stringify(listing));
//       }

//       console.log(`✅ Pushed ${processedListings.length} records from page ${page + 1}/${totalPages}`);
//     }

//     console.log("🎉 All listings stored in Redis successfully.");
//   } catch (err) {
//     console.error("❌ Error storing listings in Redis:", err.message || err);
//   }
// };
const storeListingInRedis = async () => {
  const PROGRESS_KEY = "listing:progress"; // Redis key to track progress
  const LOCK_KEY = "listing:lock";         // Optional Redis lock key

  // Optional locking
  // const isLockedel = await redis.del(LOCK_KEY);
  const isLocked = await redis.get(LOCK_KEY);
  if (isLocked) {
    console.log("🚫 Redis update already in progress. Skipping...");
    return;
  }
  await redis.set(LOCK_KEY, "1", "EX", 300); // Lock for 5 mins

  try {
    const total = await Listing.countDocuments();
    const totalPages = Math.ceil(total / BATCH_SIZE);
    const savedPage = parseInt(await redis.get(PROGRESS_KEY)) || 0;

    console.log(`📦 Total Listings: ${total}, Pages: ${totalPages}`);
    console.log(`▶️ Resuming from page: ${savedPage}`);

    for (let page = savedPage; page < totalPages; page++) {
      const listings = await Listing.find()
        .populate("owner filters")
        .skip(page * BATCH_SIZE)
        .limit(BATCH_SIZE);

      const processedListings = await Promise.all(
        listings.map(async (item) => {
          let price = 0;
          let dates = [];
          
          if (item?.source?.name === "interhome") {
            let response = await getListingAvailableDates(item?.Code);
           dates= response?.dates
           price= response?.price
          } else {
            price = item?.pricePerNight?.discount || item?.pricePerNight?.price || 0;
            dates = []
          }

          const updated = await Listing.findByIdAndUpdate(
            item._id,
            { $set: { price, dates } },
            { new: true }
          );

          if (updated) console.log("✅ Updated:", item._id);
          return updated;
        })
      );

      console.log(`✅ Processed ${processedListings.length} listings on page ${page + 1}/${totalPages}`);

      // ✅ Save progress after successful page
      await redis.set(PROGRESS_KEY, page + 1);
    }

    // ✅ Reset progress when done
    await redis.del(PROGRESS_KEY);
    console.log("🎉 All listings updated successfully.");
  } catch (err) {
    console.error("❌ Error in storeListingInRedis:", err.message || err);
  } finally {
    await redis.del(LOCK_KEY); // Release lock
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
   const defaultDate = filtered[0]

   console.log(defaultDate ," default date")
    const firstDate = defaultDate?.date; 

  const secondDate = new Date(defaultDate?.date);
  secondDate.setDate(secondDate?.getDate() + defaultDate?.minimumStay);
  const secondDateFormatted = secondDate?.toISOString()?.split('T')[0];
 const data = {
      BookingHeader: {
        SalesOffice: "0505",
        AccommodationCode: accommodationCode,
        Adults: 1,
        CheckIn:  firstDate,
        CheckOut: 
           secondDateFormatted,
        Language: "EN",
        Currency: "CHF",
      },
    };

    const price =  await getListingPrices(data) / defaultDate?.minimumStay

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
