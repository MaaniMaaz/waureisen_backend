// controllers/provider.profile.controller.js
const Provider = require('../models/provider.model');
const Booking = require('../models/booking.model');
const Listing = require('../models/listing.model');

exports.getProviderProfile = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    
    const provider = await Provider.findById(providerId)
      .select('-password') // Exclude password
      .populate('listings', 'title description images location status');
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (err) {
    next(err);
  }
};

exports.updateProviderProfile = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    
    // Don't allow updating of sensitive fields
    const {
      password, listings, role, profileStatus, ...updateData
    } = req.body;
    
    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (err) {
    next(err);
  }
};

exports.getProviderListings = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    
    const listings = await Listing.find({ 
      owner: providerId,
      ownerType: 'Provider'
    });
    
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

exports.getProviderBookings = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { status, limit } = req.query;
    
    // Build query
    let query = {
      'listing.owner': providerId 
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Find bookings for listings owned by this provider
    const bookings = await Booking.find(query)
      .populate('user', 'username firstName lastName email')
      .populate('listing')
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : null);
    
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.acceptBooking = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId)
      .populate('listing');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify this provider owns the listing
    if (booking.listing.owner.toString() !== providerId) {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }
    
    // Update booking status
    booking.status = 'confirmed';
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.rejectBooking = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId)
      .populate('listing');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify this provider owns the listing
    if (booking.listing.owner.toString() !== providerId) {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }
    
    // Update booking status
    booking.status = 'canceled';
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.getProviderAnalytics = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { timeRange = 'month' } = req.query;
    
    // Get all provider's listings
    const listings = await Listing.find({ 
      owner: providerId,
      ownerType: 'Provider'
    });
    
    const listingIds = listings.map(listing => listing._id);
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Get bookings in the date range for these listings
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: startDate }
    }).populate('listing');
    
    // Calculate analytics
    let totalRevenue = 0;
    let totalBookings = bookings.length;
    
    // Tallies for each listing
    const listingStats = {};
    
    bookings.forEach(booking => {
      totalRevenue += booking.totalPrice || 0;
      
      // Per listing data
      const listingId = booking.listing._id.toString();
      if (!listingStats[listingId]) {
        listingStats[listingId] = {
          id: listingId,
          title: booking.listing.title,
          bookings: 0,
          revenue: 0
        };
      }
      
      listingStats[listingId].bookings += 1;
      listingStats[listingId].revenue += booking.totalPrice || 0;
    });
    
    // Calculate occupancy rate (simplified)
    const totalDays = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const occupancyRate = listings.length > 0 ? 
      (totalBookings / (listings.length * totalDays)) * 100 : 0;
    
    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - totalDays);
    
    const previousBookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    const previousTotalBookings = previousBookings.length;
    let previousTotalRevenue = 0;
    
    previousBookings.forEach(booking => {
      previousTotalRevenue += booking.totalPrice || 0;
    });
    
    const previousOccupancyRate = listings.length > 0 ? 
      (previousTotalBookings / (listings.length * totalDays)) * 100 : 0;
    
    // Prepare the response
    const response = {
      performance: {
        totalBookings: {
          current: totalBookings,
          previous: previousTotalBookings
        },
        occupancyRate: {
          current: Math.round(occupancyRate),
          previous: Math.round(previousOccupancyRate)
        },
        averageNightlyRate: {
          current: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
          previous: previousTotalBookings > 0 ? Math.round(previousTotalRevenue / previousTotalBookings) : 0
        },
        totalRevenue: {
          current: totalRevenue,
          previous: previousTotalRevenue
        }
      },
      charts: {
        revenue: [],
        bookings: []
      },
      listings: Object.values(listingStats),
      insights: [
        {
          type: 'opportunity',
          message: 'Based on market trends, consider adding more high-quality photos to increase booking conversion rates.'
        }
      ]
    };
    
    // Create chart data (simplified)
    // This would be more sophisticated in a real implementation
    const weeklyBookings = [0, 0, 0, 0];
    const weeklyRevenue = [0, 0, 0, 0];
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt);
      const weekIndex = Math.floor((new Date() - bookingDate) / (7 * 24 * 60 * 60 * 1000));
      
      if (weekIndex >= 0 && weekIndex < 4) {
        weeklyBookings[3 - weekIndex]++;
        weeklyRevenue[3 - weekIndex] += booking.totalPrice || 0;
      }
    });
    
    response.charts.bookings = weeklyBookings;
    response.charts.revenue = weeklyRevenue;
    
    res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.getProviderEarnings = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { timeFrame = 'all' } = req.query;
    
    // Get all provider's listings
    const listings = await Listing.find({ 
      owner: providerId,
      ownerType: 'Provider'
    });
    
    const listingIds = listings.map(listing => listing._id);
    
    // Build date filter based on timeFrame
    let dateFilter = {};
    if (timeFrame !== 'all') {
      const now = new Date();
      let startDate;
      
      switch(timeFrame) {
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      dateFilter = { createdAt: { $gte: startDate } };
    }
    
    // Get confirmed bookings for these listings
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      status: 'confirmed',
      ...dateFilter
    });
    
    // Calculate total earnings
    let totalEarnings = 0;
    bookings.forEach(booking => {
      totalEarnings += booking.totalPrice || 0;
    });
    
    // Mock payout data for now
    // In a real system, this would come from a transactions table
    const pendingPayouts = Math.round(totalEarnings * 0.2); // 20% of earnings pending
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 15); // Next payout in 15 days
    
    res.json({
      totalEarnings: `${totalEarnings} CHF`,
      pendingPayouts: `${pendingPayouts} CHF`,
      nextPayout: `${pendingPayouts} CHF`,
      nextPayoutDate: nextPayoutDate.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric'
      })
    });
  } catch (err) {
    next(err);
  }
};

exports.getProviderTransactions = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    
    // Mock transactions for now
    // In a real system, this would come from a transactions table
    const mockTransactions = [
      { 
        id: 'T1001', 
        date: 'Apr 1, 2025', 
        description: 'Booking payment - Modern Studio', 
        booking: 'B1001', 
        amount: '480',
        type: 'earning',
        hasInvoice: true
      },
      { 
        id: 'T1002', 
        date: 'Mar 28, 2025', 
        description: 'Monthly payout', 
        booking: '-', 
        amount: '2,340',
        type: 'payout',
        hasInvoice: true
      },
      { 
        id: 'T1003', 
        date: 'Mar 25, 2025', 
        description: 'Booking payment - Mountain View Chalet', 
        booking: 'B1002', 
        amount: '690',
        type: 'earning',
        hasInvoice: true
      }
    ];
    
    res.json(mockTransactions);
  } catch (err) {
    next(err);
  }
};