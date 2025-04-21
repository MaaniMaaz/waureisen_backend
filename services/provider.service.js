const Provider = require('../models/provider.model');
const Listing = require('../models/listing.model');
const Booking = require('../models/booking.model');
const UnavailableDate = require('../models/unavailableDate.model');

// Basic provider operations
exports.getProviderById = async (id) => {
  return await Provider.findById(id);
};

// Get provider's listings (basic info)
exports.getProviderListings = async (providerId) => {
  return await Listing.find({
    owner: providerId,
    ownerType: 'Provider'
  }).select('title location status');
};

// Get listing details
exports.getListingDetails = async (listingId, providerId) => {
  return await Listing.findOne({
    _id: listingId,
    owner: providerId,
    ownerType: 'Provider'
  });
};

// Get bookings list (basic info)
// Find this function in provider.service.js and check its implementation
exports.getProviderBookings = async (providerId, filters = {}) => {
  try {
    // Get provider's listings first
    const listings = await Listing.find({
      owner: providerId,
      ownerType: 'Provider'
    }).select('_id');
    
    const listingIds = listings.map(listing => listing._id);
    
    // Build the query
    const query = {
      listing: { $in: listingIds }
    };
    
    // Add filters if provided
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    
    if (filters.listingId) {
      query.listing = filters.listingId;
    }
    
    // Get bookings
    const bookings = await Booking.find(query)
      .populate('user', 'username firstName lastName email')
      .populate('listing', 'title location images')
      .sort({ checkInDate: 1 });
    
    return bookings;
  } catch (error) {
    console.error('Error getting provider bookings:', error);
    throw error;
  }
};

exports.getBookingDetails = async (bookingId, providerId) => {
  try {
    // Get provider's listings first
    const listings = await Listing.find({
      owner: providerId,
      ownerType: 'Provider'
    }).select('_id');
    
    const listingIds = listings.map(listing => listing._id);
    
    // Find booking that belongs to one of provider's listings
    const booking = await Booking.findOne({
      _id: bookingId,
      listing: { $in: listingIds }
    })
    .populate('user', 'username firstName lastName email')
    .populate('listing', 'title location images');
    
    return booking;
  } catch (error) {
    console.error('Error getting booking details:', error);
    throw error;
  }
};

// Get user details for a booking
exports.getBookingUserDetails = async (userId) => {
  const User = require('../models/user.model'); // Import at function level to avoid circular dependency
  return await User.findById(userId)
    .select('username firstName lastName email');
};

// Get unavailable dates
exports.getUnavailableDates = async (providerId, filters = {}) => {
  const query = {};
  
  if (filters.listingId) {
    query.listing = filters.listingId;
  } else {
    const listings = await Listing.find({ 
      owner: providerId,
      ownerType: 'Provider'
    }).select('_id');
    query.listing = { $in: listings.map(l => l._id) };
  }

  if (filters.startDate) {
    query.date = { $gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    query.date = { ...query.date, $lte: new Date(filters.endDate) };
  }

  return await UnavailableDate.find(query)
    .select('date listing reason')
    .sort({ date: 1 });
};

// Block dates
exports.blockDates = async (providerId, blockData) => {
  try {
    const { listingId, startDate, endDate, reason } = blockData;
    
    // Verify listing ownership
    const listing = await Listing.findOne({
      _id: listingId,
      owner: providerId,
      ownerType: 'Provider'
    });

    if (!listing) {
      throw new Error('Listing not found or not owned by provider');
    }
    
    // Check for overlapping bookings
    const bookings = await Booking.find({
      listing: listingId,
      $or: [
        // Booking starts during the blocked period
        { checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        // Booking ends during the blocked period
        { checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        // Booking spans the entire blocked period
        { 
          checkInDate: { $lte: new Date(startDate) },
          checkOutDate: { $gte: new Date(endDate) }
        }
      ],
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (bookings.length > 0) {
      throw new Error('Cannot block dates that overlap with existing bookings');
    }
    
    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (new Date(startDate) < today) {
      throw new Error('Cannot block dates in the past');
    }

    // Create blocked dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const blockedDates = [];
    
    // Create entries for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      blockedDates.push({
        listing: listingId,
        date: new Date(date),
        reason,
        createdBy: providerId,
        createdByType: 'Provider'
      });
    }

    return await UnavailableDate.insertMany(blockedDates);
  } catch (error) {
    console.error('Error blocking dates:', error);
    throw error;
  }
};

exports.getProviderByEmail = async (email) => {
  return await Provider.findOne({ email });
};


// Provider analytics
exports.getProviderAnalytics = async (providerId, timeRange = 'month') => {
  try {
    // Get provider's listings
    const listings = await Listing.find({
      owner: providerId,
      ownerType: 'Provider'
    }).select('_id');
    
    const listingIds = listings.map(listing => listing._id);
    
    // Determine date range
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    // Get bookings for date range
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: startDate }
    });
    
    // Calculate basic metrics
    const totalBookings = {
      current: bookings.length,
      previous: Math.floor(bookings.length * 0.8) // Mock previous period data
    };
    
    // Calculate revenue
    let totalRevenue = 0;
    bookings.forEach(booking => {
      totalRevenue += booking.totalPrice || 0;
    });
    
    const revenue = {
      current: totalRevenue,
      previous: Math.floor(totalRevenue * 0.85) // Mock previous period data
    };
    
    // Mock occupancy rate and other metrics
    const occupancyRate = {
      current: bookings.length > 0 ? Math.min(85, 35 + bookings.length * 5) : 0,
      previous: bookings.length > 0 ? Math.min(80, 30 + bookings.length * 5) : 0
    };
    
    const averageNightlyRate = {
      current: totalRevenue > 0 && bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0,
      previous: totalRevenue > 0 && bookings.length > 0 ? Math.round((totalRevenue / bookings.length) * 0.9) : 0
    };
    
    // Create sample chart data
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
    const chartData = {
      revenue: Array.from({ length: days }, () => Math.floor(Math.random() * 500) + 100),
      bookings: Array.from({ length: days }, () => Math.floor(Math.random() * 3))
    };
    
    return {
      performance: {
        totalBookings,
        totalRevenue: revenue,
        occupancyRate,
        averageNightlyRate
      },
      charts: chartData
    };
  } catch (error) {
    console.error('Error getting provider analytics:', error);
    throw error;
  }
};