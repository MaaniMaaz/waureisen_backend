const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const inputFilePath = path.join(__dirname, 'waureisen1-listings (1).csv');
let totalCount = 0;
let interhomeCount = 0;
let emptyCount = 0;
let otherLinkCount = 0;

const interhomeListings = [];
const emptyListings = [];
const otherLinkListings = [];

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    try {
      totalCount++;
      const publicData = JSON.parse(row.PublicData);
      
      if (!publicData.priceOnRequest || publicData.priceOnRequest.trim() === '') {
        emptyCount++;
        emptyListings.push(row);
      } else if (publicData.priceOnRequest.includes('www.interhome')) {
        interhomeCount++;
        interhomeListings.push(row);
      } else {
        otherLinkCount++;
        otherLinkListings.push(row);
      }
    } catch (error) {
      console.error(`Error processing row: ${error.message}`);
    }
  })
  .on('end', () => {
    console.log(`Total listings processed: ${totalCount}`);
    console.log(`Listings with www.interhome in priceOnRequest: ${interhomeCount}`);
    console.log(`Listings with empty priceOnRequest: ${emptyCount}`);
    console.log(`Listings with other links: ${otherLinkCount}`);

    // Save listings to separate JSON files
    fs.writeFileSync(
      path.join(__dirname, 'interhome_published_listings.json'),
      JSON.stringify(interhomeListings, null, 2)
    );
    
    fs.writeFileSync(
      path.join(__dirname, 'empty_listings.json'),
      JSON.stringify(emptyListings, null, 2)
    );
    
    fs.writeFileSync(
      path.join(__dirname, 'other_link_listings.json'),
      JSON.stringify(otherLinkListings, null, 2)
    );
    
    console.log('Listings saved to separate JSON files');
  })
  .on('error', (error) => {
    console.error(`Error reading CSV: ${error.message}`);
  });