const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFilePath = path.join(__dirname, 'interhome_published_listings.json');
const outputFilePath = path.join(__dirname, 'interhome_listings_with_links.json');

// Read the input JSON file
try {
  console.log('Reading input file...');
  const data = fs.readFileSync(inputFilePath, 'utf8');
  const listings = JSON.parse(data);
  
  console.log(`Processing ${listings.length} listings...`);
  
  // Process each listing to extract priceOnRequest
  const processedListings = listings.map(listing => {
    try {
      // Parse the PublicData JSON string
      const publicData = JSON.parse(listing.PublicData);
      
      // Extract the priceOnRequest link
      const priceOnRequestLink = publicData.priceOnRequest || '';
      
      // Create a new object with the extracted link
      return {
        ...listing,
        PriceOnRequestLink: priceOnRequestLink
      };
    } catch (error) {
      console.error(`Error processing listing ${listing.Id}: ${error.message}`);
      // Return the original listing if there's an error
      return {
        ...listing,
        PriceOnRequestLink: ''
      };
    }
  });
  
  // Write the processed data to the output file
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(processedListings, null, 2)
  );
  
  console.log(`Processed data saved to ${outputFilePath}`);
  
  // Count listings with price on request links
  const withLinks = processedListings.filter(listing => listing.PriceOnRequestLink).length;
  console.log(`Found ${withLinks} listings with price on request links out of ${listings.length} total listings`);
  
} catch (error) {
  console.error(`Error: ${error.message}`);
}