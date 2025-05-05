const fs = require('fs');
const path = require('path');

// Path to the input JSON file
const inputFilePath = path.join(__dirname, 'interhome_listings_parsed.json');
// Path to the output JSON file
const outputFilePath = path.join(__dirname, 'unique_filters.json');

// Filter categories to extract
const filterCategories = [
  'dogFacilities',
  'facilitiesParking',
  'facilitiesWellness',
  'facilitiesaccommodationfeatures',
  'facilitieskids',
  'facilitieskitchen',
  'facilitiesmainfilters',
  'facilitiessmoking',
  'facilitiessport',
  'facilitiestodonearby',
  'facilitiesview'
];

// Function to extract unique filter values
function extractUniqueFilters() {
  try {
    // Read and parse the JSON file
    const data = fs.readFileSync(inputFilePath, 'utf8');
    const listings = JSON.parse(data);
    
    // Object to store unique filter values for each category
    const uniqueFilters = {};
    
    // Initialize the uniqueFilters object with empty sets for each category
    filterCategories.forEach(category => {
      uniqueFilters[category] = new Set();
    });
    
    // Process each listing
    listings.forEach(listing => {
      filterCategories.forEach(category => {
        // Check if the listing has the filter category
        if (listing[category] && Array.isArray(listing[category])) {
          // Add each filter value to the corresponding set
          listing[category].forEach(filter => {
            uniqueFilters[category].add(filter);
          });
        }
      });
    });
    
    // Convert sets to arrays for JSON serialization
    const result = {};
    filterCategories.forEach(category => {
      result[category] = Array.from(uniqueFilters[category]);
    });
    
    // Write the result to the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
    
    console.log(`Unique filters extracted and saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
extractUniqueFilters();