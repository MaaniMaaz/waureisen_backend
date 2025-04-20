const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFilePath = path.join(__dirname, 'interhome_listings_with_links.json');
const outputFilePath = path.join(__dirname, 'interhome_listings_with_code.json');

// Function to extract the property code from the URL
function extractPropertyCode(url) {
  if (!url) return '';
  
  // New approach: Look for the pattern after the last slash before the query parameters
  // The pattern is typically something like "fr8800.916.1"
  try {
    // Extract the part of the URL before the query parameters
    const urlWithoutParams = url.split('?')[0];
    
    // Get the last segment of the path (after the last slash)
    const lastSegment = urlWithoutParams.split('/').pop();
    
    // The code is typically after the last hyphen
    // Format is usually: property-name-code
    if (lastSegment && lastSegment.includes('-')) {
      const parts = lastSegment.split('-');
      // Get the last part after the hyphen
      const code = parts[parts.length - 1];
      
      // Validate that it matches the expected format (2 letters followed by numbers and dots)
      if (/^[a-z]{2}\d+\.\d+\.\d+$/i.test(code)) {
        return code;
      }
    }
    
    // Alternative approach: search for the pattern in the entire URL
    const regex = /([a-z]{2}\d+\.\d+\.\d+)/i;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.error(`Error extracting code from URL: ${error.message}`);
  }
  
  return '';
}

// Read the input JSON file
try {
  console.log('Reading input file...');
  const data = fs.readFileSync(inputFilePath, 'utf8');
  const listings = JSON.parse(data);
  
  console.log(`Processing ${listings.length} listings...`);
  
  // Process each listing to extract the property code
  const processedListings = listings.map(listing => {
    try {
      // Extract the code from the PriceOnRequestLink
      const propertyCode = extractPropertyCode(listing.PriceOnRequestLink);
      
      // Create a new object with the extracted code
      return {
        ...listing,
        Code: propertyCode
      };
    } catch (error) {
      console.error(`Error processing listing ${listing.Id}: ${error.message}`);
      // Return the original listing with an empty code if there's an error
      return {
        ...listing,
        Code: ''
      };
    }
  });
  
  // Write the processed data to the output file
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(processedListings, null, 2)
  );
  
  console.log(`Processed data saved to ${outputFilePath}`);
  
  // Count listings with extracted codes
  const withCodes = processedListings.filter(listing => listing.Code).length;
  console.log(`Found ${withCodes} listings with property codes out of ${listings.length} total listings`);
  
  // Show some examples of extracted codes
  const examples = processedListings
    .filter(listing => listing.Code)
    .slice(0, 5)
    .map(listing => `${listing.Title}: ${listing.Code}`);
  
  if (examples.length > 0) {
    console.log('\nExample extracted codes:');
    examples.forEach(example => console.log(`- ${example}`));
  } else {
    console.log('\nNo codes were extracted. Please check the URL format.');
    
    // Debug: Print a few sample URLs to analyze
    const sampleUrls = listings
      .filter(listing => listing.PriceOnRequestLink)
      .slice(0, 3)
      .map(listing => listing.PriceOnRequestLink);
    
    console.log('\nSample URLs for debugging:');
    sampleUrls.forEach(url => console.log(`- ${url}`));
  }
  
} catch (error) {
  console.error(`Error: ${error.message}`);
}