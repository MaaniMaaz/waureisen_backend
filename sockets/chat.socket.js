// sockets/chat.socket.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Provider = require('../models/provider.model');
const Conversation = require('../models/conversation.model');
const messageService = require('../services/message.service');
const conversationService = require('../services/conversation.service');

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.id || !decoded.role) {
        return next(new Error('Invalid token'));
      }
      
      // Set user data in socket
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);
    
    // Join rooms for user's conversations
    socket.on('join_conversations', async () => {
      try {
        let conversations;
        
        if (socket.userRole === 'user') {
          conversations = await Conversation.find({ customer: socket.userId });
        } else if (socket.userRole === 'provider') {
          conversations = await Conversation.find({ provider: socket.userId });
        }
        
        if (conversations && conversations.length > 0) {
          conversations.forEach(conversation => {
            socket.join(conversation._id.toString());
          });
          
          console.log(`${socket.userRole} ${socket.userId} joined ${conversations.length} conversation rooms`);
        }
      } catch (error) {
        console.error('Error joining conversation rooms:', error);
      }
    });
    
    // Join specific conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`${socket.userRole} ${socket.userId} joined conversation ${conversationId}`);
    });
    
    // Leave specific conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`${socket.userRole} ${socket.userId} left conversation ${conversationId}`);
    });
    
    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        
        if (!conversationId || !content) {
          return socket.emit('error', { message: 'Missing required fields' });
        }
        
        // Get conversation
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }
        
        // Check permissions
        const isAuthorized = 
          (socket.userRole === 'user' && conversation.customer.toString() === socket.userId) ||
          (socket.userRole === 'provider' && conversation.provider.toString() === socket.userId);
        
        if (!isAuthorized) {
          return socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
        }
        
        // Determine sender type
        const senderType = socket.userRole === 'user' ? 'User' : 'Provider';
        
        // Create message
        const message = await messageService.createMessage(
          conversationId,
          socket.userId,
          senderType,
          content
        );
        
        // Update conversation
        await conversationService.updateLastMessage(
          conversationId,
          content,
          socket.userId,
          senderType
        );
        
        // Broadcast message to the conversation room
        io.to(conversationId).emit('new_message', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;
        
        if (!conversationId) {
          return socket.emit('error', { message: 'Conversation ID is required' });
        }
        
        // Mark as read based on user role
        const userType = socket.userRole === 'user' ? 'user' : 'provider';
        
        await conversationService.markConversationAsRead(conversationId, userType);
        await messageService.markMessagesAsRead(conversationId, userType);
        
        // Notify the other participant
        socket.to(conversationId).emit('messages_read', { conversationId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId} (${socket.userRole})`);
    });
  });
};