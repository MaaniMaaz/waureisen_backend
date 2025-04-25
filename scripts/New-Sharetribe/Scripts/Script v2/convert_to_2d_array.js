const fs = require('fs');
const path = require('path');

// Path to the input JSON file with unique filters
const inputFilePath = path.join(__dirname, 'unique_filters.json');
// Path to the output JSON file for 2D array
const outputFilePath = path.join(__dirname, 'unique_filters_2d_array.json');

// Function to convert the unique filters to a 2D array format
function convertTo2DArray() {
  try {
    // Read and parse the JSON file with unique filters
    const data = fs.readFileSync(inputFilePath, 'utf8');
    const uniqueFilters = JSON.parse(data);
    
    // Create a 2D array where each inner array contains:
    // [0] = category name
    // [1] = array of unique filter values for that category
    const filtersArray = Object.entries(uniqueFilters).map(([category, values]) => {
      return [category, values];
    });
    
    // Write the result to the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(filtersArray, null, 2));
    
    console.log(`Unique filters converted to 2D array and saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
convertTo2DArray();