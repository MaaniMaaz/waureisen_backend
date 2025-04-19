// init-filters.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import the existing Filter model
const Filter = require('./models/filter.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to initialize predefined filters
const initPredefinedFilters = async () => {
  try {
    // Check if filters already exist
    const existingFilter = await Filter.findOne().sort({ updatedAt: -1 });
    console.log('Existing filter:', existingFilter ? 'Found' : 'None');
    
    // Check if we need to create predefined filters
    let filter;
    if (existingFilter) {
      // Use existing filter
      filter = existingFilter;
      console.log('Using existing filter with ID:', filter._id);
      
      // Check if predefined subsections exist
      const predefinedSubsectionNames = [
        'Basic Info', 'Photos', 'Amenities', 'Description', 
        'Policies & Location', 'Dog Filters'
      ];
      
      // Keep track of which predefined sections already exist
      const existingPredefinedSections = new Set();
      filter.subsections.forEach(section => {
        if (section.predefined && predefinedSubsectionNames.includes(section.name)) {
          existingPredefinedSections.add(section.name);
          console.log(`Predefined section already exists: ${section.name}`);
        }
      });
      
      // Add missing predefined sections
      const subsectionsToAdd = [];
      
      if (!existingPredefinedSections.has('Basic Info')) {
        subsectionsToAdd.push({
          name: 'Basic Info',
          description: 'Essential details about the accommodation',
          predefined: true,
          filters: [
            { name: 'People', type: 'number', required: true, predefined: true },
            { name: 'Dogs', type: 'number', required: true, predefined: true },
            { name: 'Bedrooms', type: 'number', required: true, predefined: true },
            { name: 'Rooms', type: 'number', required: true, predefined: true },
            { name: 'Washrooms', type: 'number', required: true, predefined: true },
            { 
              name: 'Property Type', 
              type: 'select', 
              required: true, 
              predefined: true, 
              options: ['Studio', 'Apartment', 'House', 'Villa', 'Cabin', 'Chalet', 'Hotel', 
                       'Holiday Home', 'Tiny House', 'Holiday Apartment', 'Bungalow', 
                       'House Boat', 'Guest House', 'Yurt', 'Log Cabin', 'Camper Van', 
                       'Farm House', 'Tent', 'Tree House'] 
            },
            { 
              name: 'Listing Source', 
              type: 'select', 
              required: true, 
              predefined: true,
              options: ['Admin', 'Provider', 'Interhome'] 
            }
          ]
        });
      }
      
      if (!existingPredefinedSections.has('Photos')) {
        subsectionsToAdd.push({
          name: 'Photos',
          description: 'Images for the accommodation',
          predefined: true,
          filters: [
            { name: 'Main Image', type: 'file', required: true, predefined: true },
            { name: 'Gallery Images', type: 'file', required: false, predefined: true }
          ]
        });
      }
      
      if (!existingPredefinedSections.has('Amenities')) {
        subsectionsToAdd.push({
          name: 'Amenities',
          description: 'Available features and facilities',
          predefined: true,
          filters: [
            { name: 'Kitchen', type: 'checkbox', required: false, predefined: true },
            { name: 'Air Conditioning', type: 'checkbox', required: false, predefined: true },
            { name: 'Parking', type: 'checkbox', required: false, predefined: true },
            { name: 'WiFi', type: 'checkbox', required: false, predefined: true },
            { name: 'Dedicated Workspace', type: 'checkbox', required: false, predefined: true },
            { name: 'Firework Free Zone', type: 'checkbox', required: false, predefined: true },
            { name: 'TV', type: 'checkbox', required: false, predefined: true },
            { name: 'Swimming Pool', type: 'checkbox', required: false, predefined: true },
            { name: 'Dogs Allowed', type: 'checkbox', required: false, predefined: true }
          ]
        });
      }
      
      if (!existingPredefinedSections.has('Description')) {
        subsectionsToAdd.push({
          name: 'Description',
          description: 'Details about the accommodation',
          predefined: true,
          filters: [
            { name: 'Short Description', type: 'text', required: true, predefined: true },
            { name: 'Full Description', type: 'text', required: true, predefined: true }
          ]
        });
      }
      
      if (!existingPredefinedSections.has('Policies & Location')) {
        subsectionsToAdd.push({
          name: 'Policies & Location',
          description: 'Rules and geographic information',
          predefined: true,
          filters: [
            { name: 'Full Address', type: 'text', required: true, predefined: true },
            { 
              name: 'Cancellation Policy', 
              type: 'select', 
              required: true, 
              predefined: true,
              options: ['flexible', 'moderate', 'strict', 'custom'] 
            },
            { name: 'No Smoking', type: 'checkbox', required: false, predefined: true },
            { name: 'No Parties', type: 'checkbox', required: false, predefined: true },
            { name: 'Quiet Hours', type: 'checkbox', required: false, predefined: true }
          ]
        });
      }
      
      if (!existingPredefinedSections.has('Dog Filters')) {
        subsectionsToAdd.push({
          name: 'Dog Filters',
          description: 'Dog-friendly features',
          predefined: true,
          filters: [
            { name: 'Firework Free Zone', type: 'checkbox', required: false, predefined: true },
            { name: 'Dog Parks Nearby', type: 'checkbox', required: false, predefined: true },
            { name: 'Dog-friendly Restaurants', type: 'checkbox', required: false, predefined: true },
            { name: 'Pet Supplies Available', type: 'checkbox', required: false, predefined: true }
          ]
        });
      }
      
      // Add missing subsections if any
      if (subsectionsToAdd.length > 0) {
        console.log(`Adding ${subsectionsToAdd.length} missing predefined subsections`);
        
        // Add subsections to the existing filter
        filter.subsections.push(...subsectionsToAdd);
        filter.updatedAt = Date.now();
        
        // Save the updated filter
        const updatedFilter = await filter.save();
        console.log('Updated filter with missing predefined subsections:', updatedFilter._id);
      } else {
        console.log('All predefined subsections already exist. No updates needed.');
      }
    } else {
      // Create new filter with predefined subsections
      console.log('No existing filter found. Creating new filter with predefined subsections');
      
      // Create default filter
      const newFilter = new Filter({
        subsections: [
          // Basic Info section
          {
            name: 'Basic Info',
            description: 'Essential details about the accommodation',
            predefined: true,
            filters: [
              { name: 'People', type: 'number', required: true, predefined: true },
              { name: 'Dogs', type: 'number', required: true, predefined: true },
              { name: 'Bedrooms', type: 'number', required: true, predefined: true },
              { name: 'Rooms', type: 'number', required: true, predefined: true },
              { name: 'Washrooms', type: 'number', required: true, predefined: true },
              { 
                name: 'Property Type', 
                type: 'select', 
                required: true, 
                predefined: true, 
                options: ['Studio', 'Apartment', 'House', 'Villa', 'Cabin', 'Chalet', 'Hotel', 
                        'Holiday Home', 'Tiny House', 'Holiday Apartment', 'Bungalow', 
                        'House Boat', 'Guest House', 'Yurt', 'Log Cabin', 'Camper Van', 
                        'Farm House', 'Tent', 'Tree House'] 
              },
              { 
                name: 'Listing Source', 
                type: 'select', 
                required: true, 
                predefined: true,
                options: ['Admin', 'Provider', 'Interhome'] 
              }
            ]
          },
          
          // Photos section
          {
            name: 'Photos',
            description: 'Images for the accommodation',
            predefined: true,
            filters: [
              { name: 'Main Image', type: 'file', required: true, predefined: true },
              { name: 'Gallery Images', type: 'file', required: false, predefined: true }
            ]
          },
          
          // Amenities section
          {
            name: 'Amenities',
            description: 'Available features and facilities',
            predefined: true,
            filters: [
              { name: 'Kitchen', type: 'checkbox', required: false, predefined: true },
              { name: 'Air Conditioning', type: 'checkbox', required: false, predefined: true },
              { name: 'Parking', type: 'checkbox', required: false, predefined: true },
              { name: 'WiFi', type: 'checkbox', required: false, predefined: true },
              { name: 'Dedicated Workspace', type: 'checkbox', required: false, predefined: true },
              { name: 'Firework Free Zone', type: 'checkbox', required: false, predefined: true },
              { name: 'TV', type: 'checkbox', required: false, predefined: true },
              { name: 'Swimming Pool', type: 'checkbox', required: false, predefined: true },
              { name: 'Dogs Allowed', type: 'checkbox', required: false, predefined: true }
            ]
          },
          
          // Description section
          {
            name: 'Description',
            description: 'Details about the accommodation',
            predefined: true,
            filters: [
              { name: 'Short Description', type: 'text', required: true, predefined: true },
              { name: 'Full Description', type: 'text', required: true, predefined: true }
            ]
          },
          
          // Policies & Location section
          {
            name: 'Policies & Location',
            description: 'Rules and geographic information',
            predefined: true,
            filters: [
              { name: 'Full Address', type: 'text', required: true, predefined: true },
              { 
                name: 'Cancellation Policy', 
                type: 'select', 
                required: true, 
                predefined: true,
                options: ['flexible', 'moderate', 'strict', 'custom'] 
              },
              { name: 'No Smoking', type: 'checkbox', required: false, predefined: true },
              { name: 'No Parties', type: 'checkbox', required: false, predefined: true },
              { name: 'Quiet Hours', type: 'checkbox', required: false, predefined: true }
            ]
          },
          
          // Dog Filters section
          {
            name: 'Dog Filters',
            description: 'Dog-friendly features',
            predefined: true,
            filters: [
              { name: 'Firework Free Zone', type: 'checkbox', required: false, predefined: true },
              { name: 'Dog Parks Nearby', type: 'checkbox', required: false, predefined: true },
              { name: 'Dog-friendly Restaurants', type: 'checkbox', required: false, predefined: true },
              { name: 'Pet Supplies Available', type: 'checkbox', required: false, predefined: true }
            ]
          }
        ]
      });
      
      const savedFilter = await newFilter.save();
      console.log('Created new filter with ID:', savedFilter._id);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('Predefined filters initialization complete!');
  } catch (error) {
    console.error('Error initializing predefined filters:', error);
    process.exit(1);
  }
};

// Run the initialization
initPredefinedFilters();