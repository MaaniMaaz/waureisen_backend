// controllers/chat.controller.js
const Message = require('../models/message.model');
const User = require('../models/user.model');

/**
 * Get chat history between a user and admin
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    console.log(`Getting chat history - UserId: ${userId}, RequesterId: ${requesterId}, Role: ${requesterRole}`);
    
    // Determine who's requesting (admin or the user themselves)
    const isAdminRequest = requesterRole === 'admin';
    const isOwnChat = userId === requesterId;
    
    // Only allow admin or the user themselves to access chat history
    if (!isAdminRequest && !isOwnChat) {
      console.log('Access denied - unauthorized request');
      return res.status(403).json({ message: 'Not authorized to access this chat history' });
    }
    
    // Build query conditions to get messages between user and admin
    const conditions = [
      // User to admin messages
      {
        sender: userId,
        senderType: 'User',
        receiverType: 'Admin',
        messageType: 'support'
      },
      // Admin to user messages
      {
        receiver: userId,
        receiverType: 'User',
        senderType: 'Admin',
        messageType: 'support'
      }
    ];
    
    // Get chat history
    const messages = await Message.find({ $or: conditions })
      .sort({ createdAt: 1 })
      .lean();
    
    console.log(`Found ${messages.length} messages for conversation with user ${userId}`);
    
    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message._id,
      content: message.content,
      sender: message.sender,
      senderType: message.senderType,
      timestamp: message.createdAt,
      isRead: message.isRead
    }));
    
    // If this is the admin viewing the conversation, mark messages as read
    if (isAdminRequest) {
      await Message.updateMany(
        {
          sender: userId, 
          senderType: 'User', 
          receiverType: 'Admin',
          isRead: false
        },
        { isRead: true }
      );
    }
    
    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    next(error);
  }
};

/**
 * Get all user conversations for admin dashboard
 */
exports.getAdminConversations = async (req, res, next) => {
  try {
    // Ensure the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden: Admins only.' });
    }
    
    // Find all unique user IDs who have sent messages to admin
    const uniqueUsers = await Message.aggregate([
      {
        $match: {
          senderType: 'User',
          receiverType: 'Admin',
          messageType: 'support'
        }
      },
      {
        $group: {
          _id: '$sender',
          lastMessageTime: { $max: '$createdAt' }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);
    
    // Get user details and last message for each conversation
    const conversations = await Promise.all(
      uniqueUsers.map(async ({ _id: userId, lastMessageTime }) => {
        // Get user details
        const user = await User.findById(userId).lean();
        if (!user) return null;
        
        // Get last message
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, senderType: 'User', receiverType: 'Admin' },
            { receiver: userId, receiverType: 'User', senderType: 'Admin' }
          ],
          messageType: 'support'
        })
        .sort({ createdAt: -1 })
        .lean();
        
        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: userId,
          senderType: 'User',
          receiverType: 'Admin',
          isRead: false,
          messageType: 'support'
        });
        
        return {
          id: user._id,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.username,
          lastMessage: lastMessage?.content || '',
          lastMessageTime,
          unreadCount,
          // Default to offline, socket service will update online status
          online: false
        };
      })
    );
    
    // Filter out null values (in case a user was deleted)
    const validConversations = conversations.filter(conv => conv !== null);
    
    res.json(validConversations);
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    next(error);
  }
};

/**
 * Get unread count for a specific conversation
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    // Build query based on who's requesting
    let query;
    if (requesterRole === 'admin') {
      // Admin wants to know how many unread messages from a specific user
      query = {
        sender: userId,
        senderType: 'User',
        receiverType: 'Admin',
        isRead: false,
        messageType: 'support'
      };
    } else {
      // User wants to know how many unread messages from admin
      // Only allow user to check their own unread count
      if (userId !== requesterId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      query = {
        receiver: userId,
        receiverType: 'User',
        senderType: 'Admin',
        isRead: false,
        messageType: 'support'
      };
    }
    
    const count = await Message.countDocuments(query);
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    next(error);
  }
};

/**
 * Get total unread count for admin across all conversations
 */
exports.getTotalUnreadCount = async (req, res, next) => {
  try {
    // Ensure the requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const count = await Message.countDocuments({
      senderType: 'User',
      receiverType: 'Admin',
      isRead: false,
      messageType: 'support'
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching total unread count:', error);
    next(error);
  }
};