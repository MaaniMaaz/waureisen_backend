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
  const isLocked = await redis.get(LOCK_KEY);
  if (isLocked) {
    console.log("🚫 Redis update already in progress. Skipping...");
    return;
  }

  await redis.set(LOCK_KEY, "1", "EX", 300); // lock for 5 minutes

  try {
    // await redis.del("listings");
     const total = await Listing.countDocuments();
    const totalPages = Math.ceil(total / BATCH_SIZE);

    console.log(`📦 Total Listings: ${total}, Pages: ${totalPages}`);

    for (let page = 0; page < totalPages; page++) {
      const listings = await Listing.find()
        .populate("owner filters")
        .skip(page * BATCH_SIZE)
        .limit(BATCH_SIZE);

      const processedListings = await Promise.all(
        listings.map(async (item) => {
          let price = 0;
          let dates = [];

          if (item?.source?.name === "interhome") {
            price = await getListingPrices(item?.Code, 2, true);
            dates = await getListingAvailableDates(item?.Code);
          } else {
            price = item?.pricePerNight?.price || 0;
          }

          return {
            ...item.toObject(),
            price,
            dates,
          };
        })
      );

      // Push each listing into Redis list
      for (const listing of processedListings) {
        await redis.rpush(REDIS_KEY, JSON.stringify(listing));
      }

      console.log(`✅ Pushed ${processedListings.length} records from page ${page + 1}/${totalPages}`);
    }

    console.log("🎉 All listings stored in Redis successfully.");
    // proceed with storing
  } finally {
    await redis.del(LOCK_KEY); // release lock
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
const getListingPrices = async (accommodationCode, pax, los) => {
  try {
    const checkInDate = moment().format("YYYY-MM-DD");

    const response = await axios.get(
      `https://ws.interhome.com/ih/b2b/V0100/accommodation/pricelistalldur/${accommodationCode}`,
      {
        params: {
          SalesOffice: "0505",
          Currency: "CHF",
          Los: los,
          Pax: pax,
        },
        headers: {
          Token: "XD1mZXqcC6",
          PartnerId: "CH1002557",
        },
      }
    );

    const formattedDate = new Date(`${checkInDate}T00:00:00Z`).toISOString().split("T")[0];
    const allPrices = response.data?.priceList?.prices?.price || [];

    const filtered = allPrices.find(
      (price) => price.duration === 7 && price.checkInDate === formattedDate
    );

    return filtered?.price || 0;
  } catch (err) {
    console.error("❌ Error in getListingPrices:", err.message || err);
    return 0;
  }
};

// 📅 Fetch listing availability dates from your backend
const getListingAvailableDates = async (accommodationCode) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/interhome/availability/${accommodationCode}`
    );

    return response?.data?.availableDates?.map(item => item?.checkInDate) || [];
  } catch (err) {
    console.error("❌ Error in getListingAvailableDates:", err.message || err);
    return [];
  }
};

module.exports = {
  storeListingInRedis,
  getStoredListings,
};
