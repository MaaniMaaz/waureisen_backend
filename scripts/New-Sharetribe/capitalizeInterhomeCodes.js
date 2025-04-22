const fs = require('fs');
const path = require('path');

// Input and output file paths
const filePath = path.join(__dirname, 'interhome_listings_with_code.json');

// Function to capitalize the code
function capitalizeCode(code) {
  if (!code) return '';
  return code.toUpperCase();
}

try {
  console.log('Reading file...');
  const data = fs.readFileSync(filePath, 'utf8');
  const listings = JSON.parse(data);
  
  console.log(`Processing ${listings.length} listings...`);
  
  // Count how many codes were found and capitalized
  let codeCount = 0;
  
  // Process each listing to capitalize the code
  const processedListings = listings.map(listing => {
    if (listing.Code) {
      codeCount++;
      return {
        ...listing,
        Code: capitalizeCode(listing.Code)
      };
    }
    return listing;
  });
  
  console.log(`Found and capitalized ${codeCount} codes`);
  
  // Write the processed data back to the file
  fs.writeFileSync(
    filePath,
    JSON.stringify(processedListings, null, 2)
  );
  
  console.log(`✅ Successfully updated ${filePath}`);
  
  // Show some examples of capitalized codes
  const examples = processedListings
    .filter(listing => listing.Code)
    .slice(0, 5)
    .map(listing => `${listing.Title}: ${listing.Code}`);
  
  if (examples.length > 0) {
    console.log('\nExample capitalized codes:');
    examples.forEach(example => console.log(`- ${example}`));
  }
  
} catch (error) {
  console.error(`Error: ${error.message}`);
}