// controllers/conversation.controller.js
const conversationService = require('../services/conversation.service');
const messageService = require('../services/message.service');
const bookingService = require('../services/booking.service');
const Listing = require('../models/listing.model');

exports.getCustomerConversations = async (req, res, next) => {
  try {
    const conversations = await conversationService.getCustomerConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

exports.getProviderConversations = async (req, res, next) => {
  try {
    const conversations = await conversationService.getProviderConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};


exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    // Get booking details
    const booking = await bookingService.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking is confirmed (chat only available for confirmed bookings)
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Conversation can only be created for confirmed bookings' });
    }
    
    // Get listing to ensure it's a Waureisen listing
    const listing = await Listing.findById(booking.listing);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.source.name !== 'waureisen') {
      return res.status(400).json({ message: 'Chat is only available for Waureisen listings' });
    }
    
    // Check user permissions
    const isCustomer = booking.user.toString() === req.user.id;
    const isProvider = listing.owner.toString() === req.user.id && listing.ownerType === 'Provider';
    
    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: 'You do not have permission to access this conversation' });
    }
    
    // Get or create conversation
    let conversation = await conversationService.getConversationByBooking(bookingId);
    
    if (!conversation) {
      conversation = await conversationService.createConversation(
        bookingId,
        booking.user,
        listing.owner,
        booking.listing
      );
      
      // Get populated conversation
      conversation = await conversationService.getConversationByBooking(bookingId);
    }
    
    // Mark messages as read
    const userType = isCustomer ? 'user' : 'provider';
    await conversationService.markConversationAsRead(conversation._id, userType);
    await messageService.markMessagesAsRead(conversation._id, userType);
    
    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

exports.markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userType = req.user.role; // 'user' or 'provider'
    
    await conversationService.markConversationAsRead(conversationId, userType);
    await messageService.markMessagesAsRead(conversationId, userType);
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getUserUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ customer: userId });
    const unreadCount = conversations.reduce((total, conv) => 
      total + (conv.unreadCustomer || 0), 0);
    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
};

exports.getProviderUnreadCount = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const conversations = await Conversation.find({ provider: providerId });
    const unreadCount = conversations.reduce((total, conv) => 
      total + (conv.unreadProvider || 0), 0);
    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
};