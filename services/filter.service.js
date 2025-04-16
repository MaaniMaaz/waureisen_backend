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
    // Create a default filter with basic subsections
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
    
    filter.subsections[subsectionIndex].name = subsectionData.name;
    filter.subsections[subsectionIndex].description = subsectionData.description;
  } else {
    // Add new subsection
    filter.subsections.push({
      name: subsectionData.name,
      description: subsectionData.description,
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
    
    filter.subsections[subsectionIndex].filters[filterIndex] = {
      ...filter.subsections[subsectionIndex].filters[filterIndex],
      ...filterData,
      _id: filter.subsections[subsectionIndex].filters[filterIndex]._id
    };
  } else {
    // Add new filter
    filter.subsections[subsectionIndex].filters.push(filterData);
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
  
  filter.subsections[subsectionIndex].filters = filter.subsections[subsectionIndex].filters.filter(
    f => f._id.toString() !== subFilterId
  );
  
  return await filter.save();
};

/**
 * Create a default filter document with basic subsections
 * @returns {Promise<Object>} Created filter document
 */
const createDefaultFilter = async () => {
  const defaultFilter = new Filter({
    subsections: [
      {
        name: 'Basic Info',
        description: 'Essential details about the accommodation',
        filters: [
          { name: 'People', type: 'number', required: true },
          { name: 'Dogs', type: 'number', required: true },
          { name: 'Bedrooms', type: 'number', required: true },
          { name: 'Rooms', type: 'number', required: true },
          { name: 'Washrooms', type: 'number', required: true }
        ]
      },
      {
        name: 'Amenities',
        description: 'Available features and facilities',
        filters: [
          { name: 'Kitchen', type: 'checkbox', required: false },
          { name: 'Air Conditioning', type: 'checkbox', required: false },
          { name: 'Parking', type: 'checkbox', required: false },
          { name: 'WiFi', type: 'checkbox', required: false }
        ]
      }
    ]
  });
  
  return await defaultFilter.save();
};