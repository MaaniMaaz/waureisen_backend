// scripts/interhome.js

const axios = require('axios');
const fs    = require('fs').promises;
const path  = require('path');
// const { MongoClient } = require('mongodb');  // <-- commented out for now

// const MONGO_URI = "mongodb+srv://...@clusterlab.8wfhr.mongodb.net/Interhome?retryWrites=true&w=majority&appName=ClusterLab";

const API_URL = 'https://partners.interhome.group/distribution_api/test/V0100/accommodation/list';
const HEADERS = {
  "PartnerId": "CH1002557",
  "Token":     "XD1mZXqcC6",
  "Accept":      "application/json"
};

/**
 * Fetches *all* pages of accommodations in parallel batches
 */
async function fetchAllAccommodations() {
  console.log("Fetching full list…");
  const { data } = await axios.get(API_URL, { headers: HEADERS });
  const items = data.accommodationItem || [];
  console.log(`→ Got ${items.length} items`);
  return items;
}


/**
 * Saves CSV + pretty JSON to disk
 */
async function saveToFiles(accommodations) {
  // 1) CSV
  const columns = ['code','name','lastModified','validFrom','validTo','brand'];
  const header  = columns.join(',');
  const rows    = accommodations.map(item =>
    columns.map(col => {
      const cell = item[col] == null ? '' : item[col].toString();
      return `"${cell.replace(/"/g,'""')}"`;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const csvPath = path.join(__dirname, 'accommodations.csv');
  await fs.writeFile(csvPath, csv);
  console.log(`✅ Written CSV to ${csvPath}`);

  // 2) Pretty JSON
  const json = JSON.stringify(accommodations, null, 2);
  const jsonPath = path.join(__dirname, 'accommodations.json');
  await fs.writeFile(jsonPath, json);
  console.log(`✅ Written JSON to ${jsonPath}`);
}

/**
 * (Commented out) — when you're ready to re‑enable DB saving, uncomment this
 */
/*
async function saveToMongo(accommodations) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db   = client.db(); // Interhome
    const coll = db.collection('accommodations');

    const ops = accommodations.map(item => ({
      updateOne: {
        filter: { code: item.code },
        update: { $set: item },
        upsert: true
      }
    }));
    const result = await coll.bulkWrite(ops);
    console.log("Bulk write result:", result);
  } finally {
    await client.close();
  }
}
*/

(async () => {
  try {
    const accommodations = await fetchAllAccommodations();
    await saveToFiles(accommodations);

    // when you're ready:
    // await saveToMongo(accommodations);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
