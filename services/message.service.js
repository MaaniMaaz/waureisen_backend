// services/message.service.js
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');

exports.getMessagesByConversation = async (conversationId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  return await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

exports.createMessage = async (conversationId, senderId, senderType, content) => {
  const newMessage = new Message({
    conversation: conversationId,
    sender: senderId,
    senderType,
    content
  });

  return await newMessage.save();
};

exports.markMessagesAsRead = async (conversationId, recipientType) => {
  const senderType = recipientType === 'user' ? 'Provider' : 'User';
  
  return await Message.updateMany(
    { 
      conversation: conversationId,
      senderType: senderType,
      isRead: false
    },
    { isRead: true }
  );
};