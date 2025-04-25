// controllers/provider.profile.controller.js
const Provider = require('../models/provider.model');
const Booking = require('../models/booking.model');
const Listing = require('../models/listing.model');
const providerService = require('../services/provider.service');
const messageService = require('../services/message.service');
const bcrypt = require('bcryptjs');

exports.getProviderProfile = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderById(req.user.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    const { password, ...providerProfile } = provider.toObject();
    res.json(providerProfile);
  } catch (err) {
    next(err);
  }
};

exports.updateProviderProfile = async (req, res, next) => {
  try {
    console.log('Provider profile update request:', req.body);
    
    const providerId = req.user.id;
    const updateData = req.body;
    
    const updatedProvider = await providerService.updateProvider(providerId, updateData);
    
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Return provider data without password
    const { password, ...providerProfile } = updatedProvider.toObject();
    res.json(providerProfile);
  } catch (err) {
    console.error('Error updating provider profile:', err);
    next(err);
  }
};



exports.updateProviderBanking = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const bankingData = req.body;
    
    // Basic validation
    if (!bankingData.bankName || !bankingData.accountHolder || !bankingData.iban) {
      return res.status(400).json({ 
        message: 'Bank name, account holder name, and IBAN are required' 
      });
    }
    
    const updatedProvider = await providerService.updateProviderBanking(providerId, bankingData);
    
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Return provider data without password
    const { password, ...providerProfile } = updatedProvider.toObject();
    res.json(providerProfile);
  } catch (err) {
    console.error('Error updating provider banking details:', err);
    next(err);
  }
};


exports.updateProviderSecurity = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }
    
    // Get provider with password
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, provider.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const success = await providerService.updateProviderPassword(providerId, hashedPassword);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to update password' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating provider security settings:', err);
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
    const { status, page, limit, sortOrder, dateRange, listingId } = req.query;
    
    // Log received parameters
    console.log('Provider bookings request params:', { 
      status, page, limit, sortOrder, dateRange, listingId 
    });
    
    // Get provider's listings first
    const listings = await Listing.find({
      owner: req.user.id,
      ownerType: "Provider",
    }).select("_id");

    const listingIds = listings.map((listing) => listing._id);

    // Build the query
    const query = {
      listing: listingId ? listingId : { $in: listingIds },
    };

    // Add status filter if provided
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        query.$or = [
          // Booking starts during the displayed month
          { checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Booking ends during the displayed month
          { checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Booking spans the entire displayed month
          { 
            checkInDate: { $lte: new Date(startDate) },
            checkOutDate: { $gte: new Date(endDate) }
          }
        ];
      }
    }

    // Pagination parameters
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNum - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await Booking.countDocuments(query);

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate("user", "username firstName lastName email")
      .populate("listing", "title location images")
      .sort({ checkInDate: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(pageSize);

    return res.json({
      bookings,
      pagination: {
        totalCount,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error getting provider bookings:", error);
    next(error);
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
    
    // Update booking status
    booking.status = 'confirmed';
    await booking.save();
    
    const listing = await Listing.findById(booking.listing);
    if (2 === 2) {
      try {
        // Log for debugging
        console.log('Creating conversation for Waureisen listing booking');
        
        // Set proper customer and provider IDs
        const customerId = booking.user;
        const providerId = req.user.id;
        
        console.log('Customer ID:', customerId);
        console.log('Provider ID:', providerId);
        console.log('Booking ID:', booking._id);
        console.log('Listing ID:', booking.listing);
        
        // Create a conversation
        const conversationService = require('../services/conversation.service');
        const messageService = require('../services/message.service');
        
        const conversation = await conversationService.createConversation(
          booking._id,
          customerId,
          providerId,
          booking.listing
        );
        
        console.log('Conversation created:', conversation);
        
        if (conversation) {
          // Send automatic message
          const message = await messageService.createMessage(
            conversation._id,
            providerId,
            'Provider',
            'Your booking has been accepted. Feel free to ask any questions!'
          );
          
          console.log('Initial message created:', message);
          
          await conversationService.updateLastMessage(
            conversation._id,
            message.content,
            providerId,
            'Provider'
          );
          
          // Emit socket event if available
          if (req.io) {
            req.io.to(conversation._id.toString()).emit('new_message', message);
            console.log('Socket message emitted');
          }
        }
      } catch (error) {
        console.error('Error creating conversation on booking acceptance:', error);
      }
    } else {
      console.log('Listing is not a Waureisen listing, skipping conversation creation');
    }
    
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


exports.getCalendarBookings = async (req, res, next) => {
  try {
    const { status, dateRange, listingId } = req.query;
    
    console.log('Calendar bookings request params:', { 
      status, dateRange, listingId 
    });
    
    // Get provider's listings first
    const listings = await Listing.find({
      owner: req.user.id,
      ownerType: "Provider",
    }).select("_id");

    const listingIds = listings.map((listing) => listing._id);

    // Build the query
    const query = {
      listing: listingId ? listingId : { $in: listingIds },
    };

    // Add status filter if provided
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        query.$or = [
          // Booking starts during the displayed month
          { checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Booking ends during the displayed month
          { checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Booking spans the entire displayed month
          { 
            checkInDate: { $lte: new Date(startDate) },
            checkOutDate: { $gte: new Date(endDate) }
          }
        ];
      }
    }

    // Get ALL bookings for the query without pagination
    const bookings = await Booking.find(query)
      .populate("user", "username firstName lastName email")
      .populate("listing", "title location images")
      .sort({ checkInDate: 1 });

    // Return just the bookings array, no pagination wrapper
    return res.json(bookings);
  } catch (error) {
    console.error("Error getting calendar bookings:", error);
    next(error);
  }
};