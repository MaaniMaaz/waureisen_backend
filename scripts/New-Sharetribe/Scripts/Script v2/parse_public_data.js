const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'interhome_listings_with_code.json');
const outputFile = path.join(__dirname, 'interhome_listings_parsed.json');

function parsePublicData(publicData) {
  try {
    return JSON.parse(publicData);
  } catch (error) {
    console.error('Error parsing PublicData:', error);
    return {};
  }
}

function processListings() {
  const rawData = fs.readFileSync(inputFile);
  const listings = JSON.parse(rawData);

  const processedListings = listings.map(listing => {
    const parsedData = parsePublicData(listing.PublicData);
    return {
      ...listing,
      ...parsedData
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(processedListings, null, 2));
  console.log(`Processed ${processedListings.length} listings. Output saved to ${outputFile}`);
}

processListings();