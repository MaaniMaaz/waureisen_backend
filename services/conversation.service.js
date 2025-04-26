// services/conversation.service.js
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const Booking = require('../models/booking.model');

exports.getConversationByBooking = async (bookingId) => {
  return await Conversation.findOne({ booking: bookingId })
    .populate('provider', 'username firstName lastName profilePicture')
    .populate('customer', 'username firstName lastName profilePicture')
    .populate({
      path: 'listing',
      select: 'title location images pricePerNight maxDogs'
    })
    .populate({
      path: 'booking',
      // Include ALL relevant booking fields, especially capacity and _id
      select: 'checkInDate checkOutDate totalPrice status capacity user listing type createdAt updatedAt _id bookingId'
    });
};

exports.getCustomerConversations = async (customerId) => {
  return await Conversation.find({ customer: customerId })
    .populate('provider', 'username firstName lastName profilePicture')
    .populate({
      path: 'listing',
      select: 'title location images'
    })
    .populate({
      path: 'booking', 
      select: 'checkInDate checkOutDate totalPrice status capacity user listing type'
    })
    .sort({ updatedAt: -1 });
};

exports.getProviderConversations = async (providerId) => {
  return await Conversation.find({ provider: providerId })
    .populate('customer', 'username firstName lastName profilePicture')
    .populate({
      path: 'listing',
      select: 'title location images'
    })
    .populate({
      path: 'booking', 
      select: 'checkInDate checkOutDate totalPrice status capacity user listing type'
    })
    .sort({ updatedAt: -1 });
};

exports.createConversation = async (bookingId, customerId, providerId, listingId) => {
  // Check if conversation already exists
  const existingConversation = await Conversation.findOne({ booking: bookingId });
  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const newConversation = new Conversation({
    booking: bookingId,
    customer: customerId,
    provider: providerId,
    listing: listingId
  });

  return await newConversation.save();
};

exports.updateLastMessage = async (conversationId, message, senderId, senderType) => {
  const updateData = {
    lastMessage: message,
    lastMessageTime: new Date(),
    updatedAt: new Date()
  };

  // Increment unread counter based on sender type
  if (senderType === 'Provider') {
    updateData.$inc = { unreadCustomer: 1 };
  } else {
    updateData.$inc = { unreadProvider: 1 };
  }

  return await Conversation.findByIdAndUpdate(
    conversationId,
    updateData,
    { new: true }
  );
};

exports.markConversationAsRead = async (conversationId, userType) => {
  const updateData = {};
  
  if (userType === 'user') {
    updateData.unreadCustomer = 0;
  } else if (userType === 'provider') {
    updateData.unreadProvider = 0;
  }

  return await Conversation.findByIdAndUpdate(
    conversationId,
    updateData,
    { new: true }
  );
};