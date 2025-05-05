const mongoose = require('mongoose');
require('dotenv').config();
const Filter = require('../../../../../models/filter.model');
const filtersData = require('C:\\Users\\wiki8\\Desktop\\Nova\\@Waureisen\\waureisen_backend\\scripts\\New-Sharetribe\\Scripts\\Script v2\\formatted_unique_filters.json');

const MONGO_URI = "mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025?retryWrites=true&w=majority&appName=ClusterWork";

async function saveFilters() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const amenitiesSubsection = {
      name: 'Amenities',
      description: 'Select the amenities and features available at your property.',
      predefined: true,
      hasSubsections: true,
      subsubsections: Object.keys(filtersData).map(subsectionName => ({
        name: subsectionName,
        predefined: true,
        filters: filtersData[subsectionName].map(filterName => ({
          name: filterName,
          type: 'checkbox',
          predefined: true
        }))
      }))
    };

    const filterTemplate = new Filter({
      isTemplate: true,
      subsections: [amenitiesSubsection]
    });

    await filterTemplate.save();
    console.log('Filters saved successfully');
  } catch (error) {
    console.error('Error saving filters:', error);
  } finally {
    mongoose.connection.close();
  }
}

saveFilters();