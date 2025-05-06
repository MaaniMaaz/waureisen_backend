// To remove the attributes selectedFilters, additionalServices, availability, and attributes from existing objects in database of Listing Model
const mongoose = require('mongoose');
const Listing = require('../../../../models/listing.model');

async function removeSelectedFields() {
  try {
    await mongoose.connect('mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025?retryWrites=true&w=majority&appName=ClusterWork');

    // Update all listings to remove the selected fields
    const result = await Listing.updateMany(
      { $or: [
        { selectedFilters: { $exists: true } },
        { additionalServices: { $exists: true } },
        { availability: { $exists: true } },
        { attributes: { $exists: true } }
      ] },
      { $unset: { selectedFilters: "", additionalServices: "", availability: "", attributes: "" } }
    );

    console.log(`Matched: ${result.matchedCount || result.n} | Modified: ${result.modifiedCount || result.nModified}`);
  } catch (error) {
    console.error('Error removing fields:', error);
  } finally {
    mongoose.connection.close();
  }
}

removeSelectedFields();