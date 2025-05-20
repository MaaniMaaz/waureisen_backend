const TravelMagazine = require('../models/travelMagazine.model');

/**
 * Get all travel magazine posts with optional filtering
 * @param {Object} filters - Optional filters like category or status
 * @returns {Promise<Array>} Array of travel magazine posts
 */
exports.getAllTravelMagazines = async (filters = {}) => {
  return await TravelMagazine.find(filters)
    .populate('author', 'username email')
    .sort({ publishDate: -1 });
};

/**
 * Get travel magazine post by ID
 * @param {string} id - Post ID
 * @returns {Promise<Object>} Travel magazine post
 */
exports.getTravelMagazineById = async (id) => {
  return await TravelMagazine.findById(id)
    .populate('author', 'username email');
};

exports.getTravelMagazineByTitle = async (title) => {
  return await TravelMagazine.find({ 
    title: { $regex: new RegExp(`^${title}$`, 'i') } 
  })
    .populate('author', 'username email');
};

/**
 * Create a new travel magazine post
 * @param {Object} data - Post data
 * @returns {Promise<Object>} Created post
 */
exports.createTravelMagazine = async (data) => {
  const newTravelMagazine = new TravelMagazine(data);
  return await newTravelMagazine.save();
};

/**
 * Update an existing travel magazine post
 * @param {string} id - Post ID
 * @param {Object} data - Updated post data
 * @returns {Promise<Object>} Updated post
 */
exports.updateTravelMagazine = async (id, data) => {
  return await TravelMagazine.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Delete a travel magazine post
 * @param {string} id - Post ID
 * @returns {Promise<void>}
 */
exports.deleteTravelMagazine = async (id) => {
  await TravelMagazine.findByIdAndDelete(id);
};

/**
 * Get published travel magazine posts
 * @param {number} limit - Maximum number of posts to return
 * @returns {Promise<Array>} Array of published posts
 */
exports.getPublishedTravelMagazines = async (limit = 10) => {
  return await TravelMagazine.find({ status: 'published' })
    .populate('author', 'username')
    .sort({ publishDate: -1 })
    .limit(limit);
};

/**
 * Get travel magazine posts by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of posts in the category
 */
exports.getTravelMagazinesByCategory = async (category) => {
  return await TravelMagazine.find({
    category,
    status: 'published'
  })
    .populate('author', 'username')
    .sort({ publishDate: -1 });
};