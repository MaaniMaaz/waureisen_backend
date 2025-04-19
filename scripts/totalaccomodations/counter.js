// fetchAllAccommodations.js
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

const BASE     = 'https://ws.interhome.com/ih/b2b/V0100';
const LIST_URL = `${BASE}/accommodation/list`;

const HEADERS = {
  PartnerId: process.env.INTERHOME_PARTNER || 'CH1002557',
  Token:     process.env.INTERHOME_TOKEN   || 'XD1mZXqcC6',
  Accept:    'application/json'
};

async function main() {
  try {
    console.log('Fetching full accommodations list...');
    const res = await axios.get(LIST_URL, { headers: HEADERS });
    const data = res.data;

    // 1) Save the entire payload
    const fullPath = path.join(__dirname, 'accommodations_full.json');
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved full payload to ${fullPath}`);

    // 2) (Optional) Also save just the count
    const items = data.accommodationItem || [];
    const countPath = path.join(__dirname, 'count.json');
    fs.writeFileSync(countPath, JSON.stringify({ total: items.length }, null, 2));
    console.log(`✅ Saved count (${items.length}) to ${countPath}`);
  } catch (err) {
    console.error('❌ Failed to fetch or write:', err.response?.data || err.message);
  }
}

main();
