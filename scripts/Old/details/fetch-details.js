// scripts/details/fetch-details.js

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
// Fix the import for p-limit v6.x
const pLimit = require('p-limit').default;

// Debug line shows the correct type now
console.log('pLimit is a', typeof pLimit);  // should log: pLimit is a function

const TEST_BASE = 'https://ws.interhome.com/test/ih/b2b/V0100';
const HEADERS = {
  PartnerId: "CH1002557",
  Token: "XD1mZXqcC6",
  Accept: "application/json",
  "Accept-Encoding": "gzip"
};

// concurrency = 50 to respect 50 RQ/sec limit
const CONCURRENCY = 50;
const limit = pLimit(CONCURRENCY);


// 1) Read codes out of your CSV
async function readCodes() {
  const csv = await fs.readFile(path.join(__dirname, 'accommodations.csv'), 'utf8');
  const lines = csv.trim().split('\n');
  return lines
    .slice(1)
    .map(line => line.match(/^"([^"]+)"/)?.[1])
    .filter(Boolean);
}

// 2) Fetch one detail, wrapped in limiter
async function fetchDetail(code) {
  return limit(async () => {
    try {
      const url = `${TEST_BASE}/accommodation/${encodeURIComponent(code)}`;
      const res = await axios.get(url, { headers: HEADERS, timeout: 10000 });
      return res.data;
    } catch (err) {
      console.error(`Error fetching ${code}:`, err.code || err.response?.status || err.message);
      return null;
    }
  });
}

// 3) Main: batch through codes
async function main() {
  const codes = await readCodes();
  console.log(`→ ${codes.length} codes to fetch.`);

  // map each code to a limited fetchDetail promise
  const detailPromises = codes.map(fetchDetail);

  // wait for all (throttled) requests to finish
  const details = (await Promise.all(detailPromises)).filter(x => x);

  console.log(`✅ Fetched ${details.length} detail payloads.`);

  // Split data into chunks to avoid string length limit
  const CHUNK_SIZE = 1000; // Adjust based on your data size
  const chunks = [];
  
  for (let i = 0; i < details.length; i += CHUNK_SIZE) {
    chunks.push(details.slice(i, i + CHUNK_SIZE));
  }
  
  console.log(`📦 Split data into ${chunks.length} chunks`);
  
  // Write JSON chunks
  for (let i = 0; i < chunks.length; i++) {
    const jsonPath = path.join(__dirname, `accommodation_details_part${i+1}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(chunks[i], null, 2));
    console.log(`✍️  Written JSON chunk ${i+1} to ${jsonPath}`);
  }

  // write CSV (same columns as before)
  const columns = ['code','name','lastModified','validFrom','validTo','brand'];
  const header  = columns.join(',');
  const rows    = details.map(item =>
    columns.map(col => `"${(item[col]||'').toString().replace(/"/g,'""')}"`).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const csvPath = path.join(__dirname, 'accommodation_details.csv');
  await fs.writeFile(csvPath, csv);
  console.log(`✍️  Written CSV to ${csvPath}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
