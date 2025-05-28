const mongoose = require('mongoose');

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025CHECK?retryWrites=true&w=majority&appName=ClusterWork';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the UnavailableDate schema (adjust according to your actual schema)
const unavailableDateSchema = new mongoose.Schema({
  listing: mongoose.Schema.Types.ObjectId,
  date: Date,
  reason: String
});

// Create the model
const UnavailableDate = mongoose.model('UnavailableDate', unavailableDateSchema);

// Function to delete all unavailable dates for the specific listing
async function deleteUnavailableDates() {
  try {
    const listingId = '68371b184a21c16cf5341308';
    
    // Delete all documents with the specified listing ID
    const result = await UnavailableDate.deleteMany({ 
      listing: new mongoose.Types.ObjectId(listingId) 
    });
    
    console.log(`Successfully deleted ${result.deletedCount} unavailable dates`);
    
  } catch (error) {
    console.error('Error deleting unavailable dates:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the deletion
deleteUnavailableDates(); 