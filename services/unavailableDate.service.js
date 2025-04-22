const UnavailableDate = require('../models/unavailableDate.model');

/**
 * Get unavailable dates for specific listings
 * @param {Array} listingIds - Array of listing IDs
 * @param {Date} startDate - Start date range (optional)
 * @param {Date} endDate - End date range (optional)
 * @returns {Promise<Array>} Array of unavailable dates
 */
exports.getUnavailableDates = async (listingIds, startDate = null, endDate = null) => {
  try {
    const query = {
      listing: { $in: listingIds }
    };
    
    // Add date range filters if provided
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }
    
    return await UnavailableDate.find(query).sort({ date: 1 });
  } catch (error) {
    console.error('Error in getUnavailableDates service:', error);
    throw error;
  }
};

/**
 * Block dates for a listing
 * @param {Object} data - Date blocking data
 * @returns {Promise<Array>} Array of created unavailable dates
 */
exports.blockDates = async (data) => {
  try {
    const { listingId, startDate, endDate, reason, createdBy, createdByType } = data;
    
    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Create array to hold all dates to be blocked
    const datesToBlock = [];
    
    // Loop through each day between start and end dates
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      datesToBlock.push({
        listing: listingId,
        date: new Date(date), // Create a new date object to avoid reference issues
        reason,
        createdBy,
        createdByType
      });
    }
    
    // Use insertMany with ordered: false to continue even if some inserts fail
    // due to duplicate date entries
    const result = await UnavailableDate.insertMany(datesToBlock, { ordered: false })
      .catch(error => {
        // If there are duplicate key errors, just return those that were successfully inserted
        if (error.code === 11000) {
          return error.insertedDocs || [];
        }
        throw error;
      });
    
    return result;
  } catch (error) {
    console.error('Error in blockDates service:', error);
    throw error;
  }
};

/**
 * Unblock dates for a listing
 * @param {string} listingId - Listing ID
 * @param {Date} startDate - Start date to unblock
 * @param {Date} endDate - End date to unblock
 * @returns {Promise<Object>} Deletion result
 */
exports.unblockDates = async (listingId, startDate, endDate) => {
  try {
    const result = await UnavailableDate.deleteMany({
      listing: listingId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    return result;
  } catch (error) {
    console.error('Error in unblockDates service:', error);
    throw error;
  }
};