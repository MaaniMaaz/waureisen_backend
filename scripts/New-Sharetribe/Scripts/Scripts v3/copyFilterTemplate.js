const mongoose = require('mongoose');

// --- Configuration ---
const SOURCE_MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025?retryWrites=true&w=majority&appName=ClusterWork';
const TARGET_MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025CHECK?retryWrites=true&w=majority&appName=ClusterWork';

// --- Mongoose Schemas (based on filter.model.js) ---
const filterDefinition = {
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['text', 'number', 'checkbox', 'select', 'radio', 'file', 'date', 'time', 'toggle'], default: 'text' },
  predefined: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  options: [{ type: mongoose.Schema.Types.Mixed, trim: true }],
  fileTypes: { type: String, default: '-' }
};

const subsubsectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  predefined: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  filters: [filterDefinition]
}, { _id: false }); // Prevent _id for subdocuments if not needed, or remove if they have _id

const subsectionSchemaStructure = {
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  predefined: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  hasSubsections: { type: Boolean, default: false },
  subsubsections: [subsubsectionSchema],
  filters: [filterDefinition]
};
// If subsections have their own _id (which they do by default in Mongoose arrays of objects)
// then we don't need _id: false here.

const filterSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', unique: true },
  isTemplate: { type: Boolean, default: false, index: true }, // Added index for faster lookup
  subsections: [subsectionSchemaStructure],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// --- Main Script Logic ---
async function copyTemplateFilter() {
  let sourceConnection, targetConnection;

  try {
    // 1. Connect to Source DB
    console.log('Connecting to source database (waureisenDB2025)...');
    sourceConnection = await mongoose.createConnection(SOURCE_MONGO_URI).asPromise();
    const SourceFilter = sourceConnection.model('Filter', filterSchema);
    console.log('Connected to source database.');

    // 2. Find the template filter in Source DB
    console.log('Searching for template filter in source database...');
    const templateToCopy = await SourceFilter.findOne({ isTemplate: true }).lean(); // .lean() for a plain JS object

    if (!templateToCopy) {
      console.log('No filter with isTemplate: true found in the source database.');
      return;
    }
    console.log(`Found template filter with ID: ${templateToCopy._id} in source.`);

    // Prepare data for upsert (remove _id as it will be reassigned or matched by query)
    const { _id, ...templateDataForTarget } = templateToCopy;

    // 3. Connect to Target DB
    console.log('\nConnecting to target database (waureisenDB2025CHECK)...');
    targetConnection = await mongoose.createConnection(TARGET_MONGO_URI).asPromise();
    const TargetFilter = targetConnection.model('Filter', filterSchema);
    console.log('Connected to target database.');

    // 4. Upsert the document into Target DB
    console.log('Upserting template filter into target database...');
    const result = await TargetFilter.findOneAndUpdate(
      { isTemplate: true }, // Query to find the document to update
      templateDataForTarget, // Data to insert or update with
      {
        upsert: true, // Create if it doesn't exist
        new: true,    // Return the new or updated document
        setDefaultsOnInsert: true // Apply schema defaults if inserting
      }
    );

    console.log('Template filter successfully copied/updated in target database.');
    console.log('Target document ID:', result._id);
    console.log('Target document isTemplate status:', result.isTemplate);

  } catch (error) {
    console.error('\nAn error occurred:');
    console.error(error);
  } finally {
    // 5. Close connections
    if (sourceConnection) {
      await sourceConnection.close();
      console.log('\nDisconnected from source database.');
    }
    if (targetConnection) {
      await targetConnection.close();
      console.log('Disconnected from target database.');
    }
  }
}

// Run the script
copyTemplateFilter();