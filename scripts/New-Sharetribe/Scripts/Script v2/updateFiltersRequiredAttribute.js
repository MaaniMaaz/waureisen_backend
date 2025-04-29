const mongoose = require('mongoose');
require('dotenv').config();
const Filter = require('../../../../models/filter.model');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025?retryWrites=true&w=majority&appName=ClusterWork";

async function updateFiltersRequiredAttribute() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const filters = await Filter.find({});

    for (const filter of filters) {
      filter.subsections.forEach(subsection => {
        subsection.required = false;
        subsection.subsubsections.forEach(subsubsection => {
          subsubsection.required = false;
        });
      });
      await filter.save();
    }

    console.log('Filters updated successfully with required:false attribute');
  } catch (error) {
    console.error('Error updating filters:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateFiltersRequiredAttribute();