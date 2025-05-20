const Camper = require('../models/camper.model');

/**
 * Get all campers with optional filtering
 * @param {Object} filters - Optional filters like category or status
 * @returns {Promise<Array>} Array of campers
 */
exports.getAllCampers = async (filters = {}) => {
  return await Camper.find(filters)
    .populate('author', 'username email')
    .sort({ publishDate: -1 });
};

/**
 * Get camper by ID
 * @param {string} id - Camper ID
 * @returns {Promise<Object>} Camper
 */
exports.getCamperById = async (id) => {
  return await Camper.findById(id)
    .populate('author', 'username email');
};

exports.getCamperByTitle = async (title) => {
 return await Camper.find({ 
  title: { $regex: new RegExp(`^${title}$`, 'i') } 
}).populate('author', 'username email');
};

/**
 * Create a new camper
 * @param {Object} data - Camper data
 * @returns {Promise<Object>} Created camper
 */
exports.createCamper = async (data) => {
  const newCamper = new Camper(data);
  return await newCamper.save();
};

/**
 * Update an existing camper
 * @param {string} id - Camper ID
 * @param {Object} data - Updated camper data
 * @returns {Promise<Object>} Updated camper
 */
exports.updateCamper = async (id, data) => {
  return await Camper.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Delete a camper
 * @param {string} id - Camper ID
 * @returns {Promise<void>}
 */
exports.deleteCamper = async (id) => {
  await Camper.findByIdAndDelete(id);
};

/**
 * Get available campers
 * @param {number} limit - Maximum number of campers to return
 * @returns {Promise<Array>} Array of available campers
 */
exports.getAvailableCampers = async (limit = 10) => {
  return await Camper.find({ status: 'Available' })
    .populate('author', 'username')
    .sort({ publishDate: -1 })
    .limit(limit);
};

/**
 * Get campers by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of campers in the category
 */
exports.getCampersByCategory = async (category) => {
  return await Camper.find({
    category,
    status: 'Available'
  })
    .populate('author', 'username')
    .sort({ publishDate: -1 });
};