// routes/conversation.routes.js
const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth');
const { isUser, isProvider } = require('../middlewares/role');

// Get user's conversations
router.get('/user', verifyToken, isUser, conversationController.getCustomerConversations);

// Get provider's conversations
router.get('/provider', verifyToken, isProvider, conversationController.getProviderConversations);

// Get or create conversation for a booking
router.get('/booking/:bookingId', verifyToken, conversationController.getOrCreateConversation);

// Mark conversation as read
router.put('/:conversationId/read', verifyToken, conversationController.markConversationAsRead);

// Get messages for a conversation
router.get('/:conversationId/messages', verifyToken, messageController.getMessages);

// Send a message
router.post('/:conversationId/messages', verifyToken, messageController.sendMessage);

// User unread count
router.get('/user/unread', verifyToken, isUser, conversationController.getUserUnreadCount);

// Provider unread count
router.get('/provider/unread', verifyToken, isProvider, conversationController.getProviderUnreadCount);

module.exports = router;