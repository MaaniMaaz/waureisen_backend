// controllers/provider.profile.controller.js
const Provider = require('../models/provider.model');
const Booking = require('../models/booking.model');
const Listing = require('../models/listing.model');
const providerService = require('../services/provider.service');
const messageService = require('../services/message.service');

exports.getProviderProfile = async (req, res, next) => {
  try {
      const provider = await providerService.getProviderById(req.user.id);
      if (!provider) {
          return res.status(404).json({ message: 'Provider profile not found' });
      }
      // Remove sensitive information
      const { password, ...providerProfile } = provider.toObject();
      res.json(providerProfile);
  } catch (err) {
      next(err);
  }
};

exports.updateProviderProfile = async (req, res, next) => {
  try {
      const updatedProvider = await providerService.updateProvider(req.user.id, req.body);
      if (!updatedProvider) {
          return res.status(404).json({ message: 'Provider profile not found' });
      }
      const { password, ...providerProfile } = updatedProvider.toObject();
      res.json(providerProfile);
  } catch (err) {
      next(err);
  }
};

exports.getProviderListings = async (req, res, next) => {
  try {
      const listings = await providerService.getProviderListings(req.user.id);
      res.json(listings);
  } catch (err) {
      next(err);
  }
};

exports.getProviderBookings = async (req, res, next) => {
  try {
      const { status, limit } = req.query;
      const bookings = await providerService.getProviderBookings(req.user.id, { status, limit });
      res.json(bookings);
  } catch (err) {
      next(err);
  }
};

exports.acceptBooking = async (req, res, next) => {
  try {
    // First try to get the booking directly by ID
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      // If not found directly, try to get booking details using the service
      booking = await providerService.getBookingDetails(req.params.id, req.user.id);
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to a listing owned by this provider
    if (booking.listing) {
      // Get the listing ID, handling both populated and non-populated cases
      const listingId = booking.listing._id || booking.listing;
      
      // Get provider's listings to verify ownership
      const listings = await Listing.find({
        owner: req.user.id,
        ownerType: 'Provider'
      }).select('_id');
      
      // Check if this booking's listing belongs to the provider
      const isProvidersListing = listings.some(listing => 
        listing._id.toString() === listingId.toString()
      );
      
      if (!isProvidersListing) {
        return res.status(403).json({ message: 'Not authorized to modify this booking' });
      }
    }
    
    booking.status = 'confirmed';
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    console.error('Error accepting booking:', err);
    next(err);
  }
};

exports.rejectBooking = async (req, res, next) => {
  try {
    // First try to get the booking directly by ID
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      // If not found directly, try to get booking details using the service
      booking = await providerService.getBookingDetails(req.params.id, req.user.id);
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to a listing owned by this provider
    if (booking.listing) {
      // Get the listing ID, handling both populated and non-populated cases
      const listingId = booking.listing._id || booking.listing;
      
      // Get provider's listings to verify ownership
      const listings = await Listing.find({
        owner: req.user.id,
        ownerType: 'Provider'
      }).select('_id');
      
      // Check if this booking's listing belongs to the provider
      const isProvidersListing = listings.some(listing => 
        listing._id.toString() === listingId.toString()
      );
      
      if (!isProvidersListing) {
        return res.status(403).json({ message: 'Not authorized to modify this booking' });
      }
    }
    
    booking.status = 'canceled';
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    console.error('Error rejecting booking:', err);
    next(err);
  }
};

exports.getProviderAnalytics = async (req, res, next) => {
  try {
      const { timeRange = 'month' } = req.query;
      const analytics = await providerService.getProviderAnalytics(req.user.id, timeRange);
      res.json(analytics);
  } catch (err) {
      next(err);
  }
};


exports.sendMessage = async (req, res, next) => {
  try {
      const message = await messageService.createMessage({
          sender: req.user.id,
          senderType: 'Provider',
          receiver: req.body.userId,
          receiverType: 'User',
          content: req.body.content,
          messageType: req.body.messageType || 'support'
      });
      res.status(201).json(message);
  } catch (err) {
      next(err);
  }
};

exports.getProviderMessages = async (req, res, next) => {
  try {
      const messages = await messageService.getProviderMessages(req.user.id);
      res.json(messages);
  } catch (err) {
      next(err);
  }
};

exports.getMessageThread = async (req, res, next) => {
  try {
      const messages = await messageService.getMessageThread(req.user.id, req.params.userId);
      res.json(messages);
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


exports.getUnavailableDates = async (req, res, next) => {
  try {
      const filters = {
          listingId: req.query.listingId,
          startDate: req.query.startDate,
          endDate: req.query.endDate
      };
      const unavailableDates = await providerService.getUnavailableDates(req.user.id, filters);
      res.json(unavailableDates);
  } catch (err) {
      next(err);
  }
};
  
  /**
   * Block dates for a listing
   */
  exports.blockDates = async (req, res, next) => {
    try {
        const blockedDates = await providerService.blockDates(req.user.id, req.body);
        res.status(201).json(blockedDates);
    } catch (err) {
        next(err);
    }
};
  
  /**
   * Unblock dates for a listing
   */
  exports.unblockDates = async (req, res, next) => {
    try {
        await providerService.unblockDates(req.user.id, req.body.listingId, req.body.dates);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};