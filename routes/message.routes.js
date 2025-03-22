const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const messageController = require('../controllers/message.controller');

// Get all messages (protected)
router.get('/', verifyToken, messageController.getAllMessages);

// Get specific message
router.get('/:id', verifyToken, messageController.getMessageById);

// Get user's messages
router.get('/user/messages', verifyToken, messageController.getMessagesByUser);

// Get listing's messages
router.get('/listing/:listingId/messages', verifyToken, messageController.getMessagesByListing);

// Create new message
router.post('/', verifyToken, messageController.createMessage);

// Update message
router.put('/:id', verifyToken, messageController.updateMessage);

// Delete message
router.delete('/:id', verifyToken, messageController.deleteMessage);

// Mark message as read
router.patch('/:id/read', verifyToken, messageController.markAsRead);

module.exports = router;