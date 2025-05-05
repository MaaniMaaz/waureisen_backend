const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Input and output file paths
const inputFilePath = path.join(__dirname, 'waureisen1-listings (1).csv');
const outputFilePath = path.join(__dirname, 'unique_listing_types.json');

// Set to store unique listing types
const uniqueListingTypes = new Set();

// Create a readable stream from the CSV file
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    try {
      // Parse the PublicData JSON string
      const publicData = JSON.parse(row.PublicData);
      
      // Add the listing type to our set
      if (publicData.listingType) {
        uniqueListingTypes.add(publicData.listingType);
      }
    } catch (error) {
      console.error(`Error processing row: ${error.message}`);
    }
  })
  .on('end', () => {
    // Convert set to array and save as JSON
    const uniqueTypesArray = Array.from(uniqueListingTypes);
    
    fs.writeFileSync(
      outputFilePath, 
      JSON.stringify(uniqueTypesArray, null, 2)
    );
    
    console.log(`Found ${uniqueTypesArray.length} unique listing types:`);
    console.log(uniqueTypesArray);
    console.log(`Saved to ${outputFilePath}`);
  })
  .on('error', (error) => {
    console.error(`Error reading CSV: ${error.message}`);
  });