// listingType = interhomeaccommocation
// State = published
// Saved to interhome_published_listings.json
// 269 Published 3 Drafts

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Input and output file paths
const inputFilePath = path.join(__dirname, 'waureisen1-listings (1).csv');
const outputCsvPath = path.join(__dirname, 'interhome_published_listings.csv');
const outputJsonPath = path.join(__dirname, 'interhome_published_listings.json');

// Array to store filtered results
const filteredListings = [];
// Counter for total listings
let totalListings = 0;

// Create a readable stream from the CSV file
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Increment total count
    totalListings++;
    
    try {
      // Parse the PublicData JSON string
      const publicData = JSON.parse(row.PublicData);
      
      // Check if the listing matches our criteria
      if (
        publicData.listingType === 'interhomeaccommocation' && 
        row.State === 'published'
      ) {
        // Add to our filtered results
        filteredListings.push(row);
      }
    } catch (error) {
      console.error(`Error processing row: ${error.message}`);
    }
  })
  .on('end', () => {
    // Log both total and filtered counts
    console.log(`Total listings processed: ${totalListings}`);
    console.log(`Filtered ${filteredListings.length} Interhome published listings`);
    console.log(`Filter ratio: ${((filteredListings.length / totalListings) * 100).toFixed(2)}%`);
    
    // Save as CSV
    const csvWriter = createCsvWriter({
      path: outputCsvPath,
      header: Object.keys(filteredListings[0] || {}).map(id => ({ id, title: id }))
    });
    
    csvWriter.writeRecords(filteredListings)
      .then(() => console.log(`CSV file saved to ${outputCsvPath}`));
    
    // Save as JSON
    fs.writeFileSync(
      outputJsonPath, 
      JSON.stringify(filteredListings, null, 2)
    );
    console.log(`JSON file saved to ${outputJsonPath}`);
  })
  .on('error', (error) => {
    console.error(`Error reading CSV: ${error.message}`);
  });