const Filter = require('../models/filter.model');

/**
 * Get all filters
 * @returns {Promise<Array>} Array of filter documents
 */
exports.getAllFilters = async () => {
  return await Filter.find();
};

/**
 * Get a single filter by ID
 * @param {string} id - The filter document ID
 * @returns {Promise<Object>} Filter document
 */
exports.getFilterById = async (id) => {
  return await Filter.findById(id);
};

/**
 * Create a new filter document
 * @param {Object} data - Filter data
 * @returns {Promise<Object>} Created filter document
 */
exports.createFilter = async (data) => {
  const newFilter = new Filter(data);
  return await newFilter.save();
};

/**
 * Update an existing filter
 * @param {string} id - The filter document ID
 * @param {Object} data - Updated filter data
 * @returns {Promise<Object>} Updated filter document
 */
exports.updateFilter = async (id, data) => {
  return await Filter.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Delete a filter
 * @param {string} id - The filter document ID
 * @returns {Promise<void>}
 */
exports.deleteFilter = async (id) => {
  await Filter.findByIdAndDelete(id);
};

/**
 * Get active filter document with subsections
 * @returns {Promise<Object>} Filter document with subsections
 */
exports.getActiveFilters = async () => {
  // Get the most recently updated filter document or create a new one if none exists
  let filter = await Filter.findOne().sort({ updatedAt: -1 });
  
  if (!filter) {
    // Create a default filter with predefined subsections
    filter = await createDefaultFilter();
  }
  
  return filter;
};

/**
 * Add or update a subsection
 * @param {string} filterId - The filter document ID
 * @param {Object} subsectionData - Subsection data to add/update
 * @param {string|null} subsectionId - Existing subsection ID to update (null for new subsection)
 * @returns {Promise<Object>} Updated filter document
 */
exports.addOrUpdateSubsection = async (filterId, subsectionData, subsectionId = null) => {
  const filter = await Filter.findById(filterId);
  
  if (!filter) {
    throw new Error('Filter not found');
  }
  
  if (subsectionId) {
    // Update existing subsection
    const subsectionIndex = filter.subsections.findIndex(
      subsection => subsection._id.toString() === subsectionId
    );
    
    if (subsectionIndex === -1) {
      throw new Error('Subsection not found');
    }
    
    // Check if it's a predefined subsection
    if (filter.subsections[subsectionIndex].predefined) {
      throw new Error('Cannot modify predefined subsection');
    }
    
    filter.subsections[subsectionIndex].name = subsectionData.name;
    filter.subsections[subsectionIndex].description = subsectionData.description;
  } else {
    // Add new subsection
    filter.subsections.push({
      name: subsectionData.name,
      description: subsectionData.description,
      predefined: false, // Custom subsections are not predefined
      filters: []
    });
  }
  
  return await filter.save();
};

/**
 * Delete a subsection
 * @param {string} filterId - The filter document ID
 * @param {string} subsectionId - The subsection ID to delete
 * @returns {Promise<Object>} Updated filter document
 */
exports.deleteSubsection = async (filterId, subsectionId) => {
  const filter = await Filter.findById(filterId);
  
  if (!filter) {
    throw new Error('Filter not found');
  }
  
  // Find the subsection
  const subsectionIndex = filter.subsections.findIndex(
    subsection => subsection._id.toString() === subsectionId
  );
  
  if (subsectionIndex === -1) {
    throw new Error('Subsection not found');
  }
  
  // Check if it's a predefined subsection
  if (filter.subsections[subsectionIndex].predefined) {
    throw new Error('Cannot delete predefined subsection');
  }
  
  filter.subsections = filter.subsections.filter(
    subsection => subsection._id.toString() !== subsectionId
  );
  
  return await filter.save();
};

/**
 * Add or update a filter within a subsection
 * @param {string} filterId - The filter document ID
 * @param {string} subsectionId - The subsection ID
 * @param {Object} filterData - Filter data to add/update
 * @param {string|null} subFilterId - Existing filter ID to update (null for new filter)
 * @returns {Promise<Object>} Updated filter document
 */
exports.addOrUpdateSubsectionFilter = async (filterId, subsectionId, filterData, subFilterId = null) => {
  const filter = await Filter.findById(filterId);
  
  if (!filter) {
    throw new Error('Filter not found');
  }
  
  const subsectionIndex = filter.subsections.findIndex(
    subsection => subsection._id.toString() === subsectionId
  );
  
  if (subsectionIndex === -1) {
    throw new Error('Subsection not found');
  }
  
  if (subFilterId) {
    // Update existing filter
    const filterIndex = filter.subsections[subsectionIndex].filters.findIndex(
      f => f._id.toString() === subFilterId
    );
    
    if (filterIndex === -1) {
      throw new Error('Filter not found in subsection');
    }
    
    // Check if it's a predefined filter
    if (filter.subsections[subsectionIndex].filters[filterIndex].predefined) {
      throw new Error('Cannot modify predefined filter');
    }
    
    filter.subsections[subsectionIndex].filters[filterIndex] = {
      ...filter.subsections[subsectionIndex].filters[filterIndex],
      ...filterData,
      predefined: false, // Ensure predefined status doesn't change
      _id: filter.subsections[subsectionIndex].filters[filterIndex]._id
    };
  } else {
    // Add new filter
    const newFilter = {
      ...filterData,
      predefined: false // New filters are not predefined
    };
    filter.subsections[subsectionIndex].filters.push(newFilter);
  }
  
  return await filter.save();
};

/**
 * Delete a filter from a subsection
 * @param {string} filterId - The filter document ID
 * @param {string} subsectionId - The subsection ID
 * @param {string} subFilterId - The filter ID to delete
 * @returns {Promise<Object>} Updated filter document
 */
exports.deleteSubsectionFilter = async (filterId, subsectionId, subFilterId) => {
  const filter = await Filter.findById(filterId);
  
  if (!filter) {
    throw new Error('Filter not found');
  }
  
  const subsectionIndex = filter.subsections.findIndex(
    subsection => subsection._id.toString() === subsectionId
  );
  
  if (subsectionIndex === -1) {
    throw new Error('Subsection not found');
  }
  
  // Find the filter
  const filterIndex = filter.subsections[subsectionIndex].filters.findIndex(
    f => f._id.toString() === subFilterId
  );
  
  if (filterIndex === -1) {
    throw new Error('Filter not found in subsection');
  }
  
  // Check if it's a predefined filter
  if (filter.subsections[subsectionIndex].filters[filterIndex].predefined) {
    throw new Error('Cannot delete predefined filter');
  }
  
  filter.subsections[subsectionIndex].filters = filter.subsections[subsectionIndex].filters.filter(
    f => f._id.toString() !== subFilterId
  );
  
  return await filter.save();
};

/**
 * Create a default filter document with predefined subsections
 * @returns {Promise<Object>} Created filter document
 */
const createDefaultFilter = async () => {
  const defaultFilter = new Filter({
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
          { name: 'Property Type', type: 'select', required: true, predefined: true, 
            options: ['Studio', 'Apartment', 'House', 'Villa', 'Cabin', 'Chalet', 'Hotel', 
                     'Holiday Home', 'Tiny House', 'Holiday Apartment', 'Bungalow', 
                     'House Boat', 'Guest House', 'Yurt', 'Log Cabin', 'Camper Van', 
                     'Farm House', 'Tent', 'Tree House'] },
          { name: 'Listing Source', type: 'select', required: true, predefined: true,
            options: ['Admin', 'Provider', 'Interhome'] }
        ]
      },
      
      // Photos section
      {
        name: 'Photos',
        description: 'Images for the accommodation',
        predefined: true,
        filters: [
          { name: 'Main Image', type: 'text', required: true, predefined: true },
          { name: 'Gallery Images', type: 'text', required: false, predefined: true }
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
          { name: 'Cancellation Policy', type: 'select', required: true, predefined: true,
            options: ['flexible', 'moderate', 'strict', 'custom'] },
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
  
  return await defaultFilter.save();
};

module.exports = {
  getAllFilters: exports.getAllFilters,
  getFilterById: exports.getFilterById,
  createFilter: exports.createFilter,
  updateFilter: exports.updateFilter,
  deleteFilter: exports.deleteFilter,
  getActiveFilters: exports.getActiveFilters,
  addOrUpdateSubsection: exports.addOrUpdateSubsection,
  deleteSubsection: exports.deleteSubsection,
  addOrUpdateSubsectionFilter: exports.addOrUpdateSubsectionFilter,
  deleteSubsectionFilter: exports.deleteSubsectionFilter,
  createDefaultFilter
};