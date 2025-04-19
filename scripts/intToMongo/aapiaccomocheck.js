// fetchDetails.js
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

// ───────── API Setup ─────────
const BASE = 'https://partners.interhome.group/distribution_api/test/V0100';
const DETAIL_URL = code => `${BASE}/accommodation/${encodeURIComponent(code)}`;
const HEADERS = {
  "PartnerId": "CH1002557",
  "Token":     "XD1mZXqcC6",
  "Accept":    "application/json"
};

async function main() {
  // 1) Load the 5 codes from listings.json
  const listingsPath = path.join(__dirname, 'listings.json');
  if (!fs.existsSync(listingsPath)) {
    console.error('⚠️  listings.json not found. Run interhomeToMongo.js first.');
    process.exit(1);
  }
  const listings = JSON.parse(fs.readFileSync(listingsPath));
  const codes = listings.map(l => l.Code);

  console.log(`Fetching details for codes:\n  ${codes.join('\n  ')}\n`);

  // 2) Fetch details in parallel
  const details = {};
  await Promise.all(codes.map(async code => {
    try {
      const res = await axios.get(DETAIL_URL(code), { headers: HEADERS });
      // accomodate both possible keys
      details[code] = res.data.Accommodation || res.data.accommodation;
      console.log(`✅ Got detail for ${code}`);
    } catch (err) {
      console.error(`❌ Error fetching ${code}:`, err.response?.status || err.message);
      details[code] = null;
    }
  }));

  // 3) Write out details.json
  const outPath = path.join(__dirname, 'details.json');
  fs.writeFileSync(outPath, JSON.stringify(details, null, 2));
  console.log(`\n✅ Saved all details to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
