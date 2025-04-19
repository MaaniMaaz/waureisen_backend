// routes/chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middlewares/auth');
const { isUser, isAdmin } = require('../middlewares/role');

// Debug middleware
router.use((req, res, next) => {
  console.log(`Chat route accessed: ${req.method} ${req.url}`);
  console.log('User in request:', req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'No user');
  next();
});

// Fix the authentication in these routes - make sure the verifyToken middleware is passing user data properly
// Get chat history between user and admin
router.get('/history/:userId', verifyToken, chatController.getChatHistory);

// Get all user conversations for admin
router.get('/conversations', verifyToken, isAdmin, chatController.getAdminConversations);

// Get unread count for a specific conversation
router.get('/unread/:userId', verifyToken, chatController.getUnreadCount);

// Get total unread count for admin
router.get('/unread', verifyToken, isAdmin, chatController.getTotalUnreadCount);

// Catch-all route for debugging
router.all('*', (req, res) => {
  res.status(404).json({ 
    message: 'Chat endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

module.exports = router;