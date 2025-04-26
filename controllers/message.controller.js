// controllers/message.controller.js
const messageService = require('../services/message.service');
const conversationService = require('../services/conversation.service');
const Conversation = require('../models/conversation.model');

exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page, limit } = req.query;
    
    // Validate user permission to access these messages
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const isAuthorized = 
      (req.user.role === 'user' && conversation.customer.toString() === req.user.id) ||
      (req.user.role === 'provider' && conversation.provider.toString() === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to access these messages' });
    }
    
    const messages = await messageService.getMessagesByConversation(
      conversationId,
      parseInt(page) || 1,
      parseInt(limit) || 50
    );
    
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }
    
    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const isAuthorized = 
      (req.user.role === 'user' && conversation.customer.toString() === req.user.id) ||
      (req.user.role === 'provider' && conversation.provider.toString() === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }
    
    // Determine sender type based on user role
    const senderType = req.user.role === 'user' ? 'User' : 'Provider';
    
    // Create the message
    const message = await messageService.createMessage(
      conversationId,
      req.user.id,
      senderType,
      content
    );
    
    // Update last message in conversation
    await conversationService.updateLastMessage(
      conversationId,
      content,
      req.user.id,
      senderType
    );
    
    // Send socket event (will be handled in socket setup)
    if (req.io) {
      req.io.to(conversationId).emit('new_message', message);
    }
    
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};