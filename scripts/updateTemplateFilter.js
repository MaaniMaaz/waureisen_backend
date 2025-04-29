const mongoose = require('mongoose');
const Filter = require('../models/filter.model');

const MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025?retryWrites=true&w=majority&appName=ClusterWork';

// Static data from admin/accommodations/new page
const staticData = {
  subsections: [
    {
      name: 'Basic Info',
      description: 'Essential details about the accommodation',
      predefined: true,
      required: true,
      subsubsections: [
        {
          name: 'Basic Info',
          description: 'Basic information about the listing',
          predefined: true,
          required: true,
          filters: [
            { name: 'Listing Title', type: 'text', required: true, predefined: true },
            { name: 'Listing Source', type: 'select', required: true, predefined: true, options: ['Admin', 'Provider', 'Interhome'] },
            { name: 'Property Type', type: 'select', required: true, predefined: true, options: ['Studio', 'Apartment', 'House', 'Villa', 'Cabin', 'Chalet', 'Hotel', 'Holiday Home', 'Tiny House', 'Holiday Apartment', 'Bungalow', 'House Boat', 'Guest House', 'Yurt', 'Log Cabin', 'Camper Van', 'Farm House', 'Tent', 'Tree House'] }
          ]
        },
        {
          name: 'Capacity',
          description: 'Accommodation capacity details',
          predefined: true,
          required: true,
          filters: [
            { name: 'People', type: 'number', required: true, predefined: true },
            { name: 'Dogs', type: 'number', required: true, predefined: true },
            { name: 'Bedrooms', type: 'number', required: true, predefined: true },
            { name: 'Rooms', type: 'number', required: true, predefined: true },
            { name: 'Washrooms', type: 'number', required: true, predefined: true }
          ]
        },
        {
          name: 'Pricing',
          description: 'Pricing information for the accommodation',
          predefined: true,
          required: true,
          filters: [
            { name: 'Currency', type: 'select', required: true, predefined: true, options: ['CHF', 'EUR', 'USD'] },
            { name: 'Regular Price per Night', type: 'number', required: true, predefined: true },
            { name: 'Discounted Price per Night', type: 'number', required: false, predefined: true }
          ]
        },
        {
          name: 'Availability',
          description: 'Availability settings for the accommodation',
          predefined: true,
          required: true,
          filters: [
            { name: 'Check-in/Check-out Dates', type: 'date', required: true, predefined: true },
            { name: 'Check-in Time', type: 'time', required: true, predefined: true, options: { format: '12h', showMinutes: false } },
            { name: 'Check-out Time', type: 'time', required: true, predefined: true, options: { format: '12h', showMinutes: false } },
            { name: 'Allow Instant Booking', type: 'toggle', required: false, predefined: true },
            { name: 'Active Listing', type: 'toggle', required: false, predefined: true }
          ]
        }
      ]
    },
    {
      name: 'Photos',
      description: 'Images for the accommodation',
      predefined: true,
      required: true,
      subsubsections: [
        {
          name: 'Main Image',
          description: 'Primary image for the listing',
          predefined: true,
          required: true,
          filters: [
            { name: 'Main Image', type: 'file', required: true, predefined: true, fileTypes: 'image/*' }
          ]
        },
        {
          name: 'Gallery',
          description: 'At least 5 pictures. For best results, use high-resolution images in landscape orientation. For more bookings, we recommend uploading pictures with dogs.',
          predefined: true,
          required: true,
          filters: [
            { name: 'Gallery Images', type: 'file', required: true, predefined: true, fileTypes: 'image/*' }
          ]
        }
      ]
    },
    {
      name: 'Description',
      description: 'Detailed information about the accommodation',
      predefined: true,
      required: true,
      subsubsections: [
        {
          name: 'Description',
          description: 'Listing description details',
          predefined: true,
          required: true,
          filters: [
            { name: 'Short Description', type: 'text', required: true, predefined: true },
            { name: 'Full Description', type: 'text', required: true, predefined: true }
          ]
        }
      ]
    },
    {
      name: 'Policies & Location',
      description: 'Rules and location information',
      predefined: true,
      required: true,
      subsubsections: [
        {
          name: 'Location',
          description: 'Location details',
          predefined: true,
          required: true,
          filters: [
            { name: 'Full Address', type: 'text', required: true, predefined: true }
          ]
        },
        {
          name: 'Policies',
          description: 'Listing policies',
          predefined: true,
          required: true,
          filters: [
            { name: 'Cancellation Policy', type: 'select', required: true, predefined: true, options: ['flexible', 'moderate', 'strict', 'custom'] }
          ]
        },
        {
          name: 'House Rules',
          description: 'Rules for guests staying at the property',
          predefined: true,
          required: true,
          filters: [
            { name: 'No Smoking', type: 'checkbox', required: false, predefined: true },
            { name: 'No Parties or Events', type: 'checkbox', required: false, predefined: true },
            { name: 'Quiet Hours After 10 PM', type: 'checkbox', required: false, predefined: true }
          ]
        },
        {
          name: 'Additional Documents',
          description: 'Upload any additional policy documents or guidelines (PDF, DOCX, or TXT)',
          predefined: true,
          required: false,
          filters: [
            { name: 'Policy Documents', type: 'file', required: false, predefined: true, fileTypes: '.pdf,.docx,.txt' }
          ]
        }
      ]
    }
  ]
};

async function updateTemplateFilter() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the existing template filter
    let templateFilter = await Filter.findOne({ isTemplate: true });

    if (!templateFilter) {
      // Create new template filter if it doesn't exist
      templateFilter = new Filter({
        isTemplate: true,
        subsections: staticData.subsections
      });
    } else {
      // Update existing template filter
      // Keep the Amenities subsection
      const amenitiesSubsection = templateFilter.subsections.find(sub => sub.name === 'Amenities');
      
      // Update with new subsections
      templateFilter.subsections = staticData.subsections;
      
      // Add back the Amenities subsection if it exists
      if (amenitiesSubsection) {
        templateFilter.subsections.push(amenitiesSubsection);
      }
    }

    // Save the updated template filter
    await templateFilter.save();
    console.log('Template filter updated successfully');

  } catch (error) {
    console.error('Error updating template filter:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the update
updateTemplateFilter(); 