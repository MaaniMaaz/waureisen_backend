// socketServer.js - Updated version
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let io;

// Import Admin model to get admin ID
const Admin = require('./models/admin.model');

// Cache for admin ID
let cachedAdminId = null;

module.exports = {
  init: (server) => {
    // Initialize Socket.IO with explicit path and more permissive CORS
    io = socketIo(server, {
      path: '/socket.io', // Explicitly set the Socket.IO path
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      },
      // Add transport and connection timeout settings
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Track connected users
    const connectedUsers = new Map();
    
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.error('Socket auth failed: No token provided');
        return next(new Error('Authentication error: Token not provided'));
      }
      
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.id) {
          console.error('Socket auth failed: Invalid token payload', decoded);
          return next(new Error('Authentication error: Invalid token payload'));
        }
        
        console.log('Socket auth successful for user:', decoded.id, 'role:', decoded.role);
        socket.user = decoded;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        return next(new Error('Authentication error: ' + error.message));
      }
    });

    io.on('connection', async (socket) => {
      console.log(`User connected: ${socket.user.id}, Role: ${socket.user.role}`);
      
      // Store user connection
      connectedUsers.set(socket.user.id, {
        socketId: socket.id,
        role: socket.user.role
      });
      
      // Send online users to admin
      if (socket.user.role === 'admin') {
        const onlineUsers = [...connectedUsers.entries()]
          .filter(([userId, user]) => user.role === 'user')
          .map(([userId]) => userId);
          
        socket.emit('online-users', onlineUsers);
      }
      
      // Handle join chat
      socket.on('join-chat', ({ userId }) => {
        const roomId = createRoomId(userId, 'admin');
        socket.join(roomId);
        console.log(`${socket.user.role} joined room: ${roomId}`);
      });
      
      // Handle new message
      socket.on('send-message', async (message) => {
        try {
          const { receiverId, content } = message;
          
          // Determine sender and receiver info
          const senderId = socket.user.id;
          const senderType = capitalizeFirstLetter(socket.user.role);
          
          let receiverType;
          let actualReceiverId;
          
          // Handle special case when receiverId is 'admin'
          if (receiverId === 'admin') {
            receiverType = 'Admin';
            
            // Get an actual admin ID from the database if needed
            actualReceiverId = await getAdminId();
            if (!actualReceiverId) {
              throw new Error('Could not find admin user ID');
            }
          } else {
            // For other cases, use the provided receiverId
            actualReceiverId = receiverId;
            // If sender is admin, receiver is likely a user
            receiverType = senderType === 'Admin' ? 'User' : 'Admin';
          }
          
          // Create room ID
          const roomId = createRoomId(
            senderType === 'User' ? senderId : actualReceiverId,
            'admin'
          );
          
          console.log(`Message from ${senderType} (${senderId}) to ${receiverType} (${actualReceiverId}) in room: ${roomId}`);
          
          // Format message object
          const messageData = {
            content,
            sender: senderId,
            senderType,
            receiver: actualReceiverId,
            receiverType,
            timestamp: new Date().toISOString(),
            isRead: false,
            id: Date.now().toString(),
            messageType: 'support' // Make sure to set the messageType
          };
          
          // Save message to database
          const savedMessage = await saveMessage(messageData);
          
          // Broadcast message to room
          console.log(`Broadcasting message to room: ${roomId}`);
          io.to(roomId).emit('new-message', savedMessage);
          
          // If recipient is not in the room, increment unread count
          const receiverSocketId = connectedUsers.get(actualReceiverId)?.socketId;
          if (receiverSocketId) {
            const receiverSocket = io.sockets.sockets.get(receiverSocketId);
            if (receiverSocket && !receiverSocket.rooms.has(roomId)) {
              io.to(receiverSocketId).emit('unread-message', {
                conversationId: senderType === 'User' ? senderId : actualReceiverId
              });
            }
          }
          
        } catch (error) {
          console.error('Error processing message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });
      
      // Handle marking messages as read
      socket.on('mark-read', async ({ conversationId }) => {
        try {
          // Mark messages as read in database
          await markMessagesAsRead(
            conversationId,
            socket.user.role === 'admin' ? 'User' : 'Admin'
          );
          
          // Create room ID
          const roomId = createRoomId(
            socket.user.role === 'admin' ? conversationId : socket.user.id,
            'admin'
          );
          
          // Notify room that messages have been read
          io.to(roomId).emit('messages-read', { conversationId });
          
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
        connectedUsers.delete(socket.user.id);
        
        // Notify admins about user going offline
        if (socket.user.role === 'user') {
          const adminSockets = [...connectedUsers.entries()]
            .filter(([userId, user]) => user.role === 'admin')
            .map(([userId, user]) => user.socketId);
            
          adminSockets.forEach(socketId => {
            io.to(socketId).emit('user-offline', socket.user.id);
          });
        }
      });
    });
    
    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }
};

// Helper function to create a consistent room ID
function createRoomId(userId, adminType) {
  return `chat_${userId}_${adminType}`;
}

// Helper function to get Admin ID from database
async function getAdminId() {
  // Use cached admin ID if available
  if (cachedAdminId) {
    return cachedAdminId;
  }
  
  try {
    // Find the first admin user in the database
    const admin = await Admin.findOne({}).select('_id');
    if (admin && admin._id) {
      cachedAdminId = admin._id.toString();
      return cachedAdminId;
    }
    console.error('No admin found in the database');
    return null;
  } catch (error) {
    console.error('Error fetching admin ID:', error);
    return null;
  }
}

// Function to capitalize first letter (user -> User, admin -> Admin)
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to save message to database
async function saveMessage(messageData) {
  try {
    const Message = require('./models/message.model');
    
    const message = new Message({
      sender: messageData.sender,
      senderType: messageData.senderType,
      receiver: messageData.receiver,
      receiverType: messageData.receiverType,
      content: messageData.content,
      isRead: messageData.isRead,
      messageType: messageData.messageType || 'support',
      createdAt: new Date()
    });
    
    console.log('Saving message to database:', {
      sender: message.sender,
      senderType: message.senderType,
      receiver: message.receiver,
      receiverType: message.receiverType
    });
    
    const savedMessage = await message.save();
    
    // Return formatted message
    return {
      id: savedMessage._id,
      content: savedMessage.content,
      sender: savedMessage.sender,
      senderType: savedMessage.senderType,
      receiver: savedMessage.receiver,
      timestamp: savedMessage.createdAt,
      isRead: savedMessage.isRead
    };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

// Function to mark messages as read
async function markMessagesAsRead(conversationUserId, senderType) {
  try {
    const Message = require('./models/message.model');
    
    // If admin is marking messages as read, find messages from user to admin
    // If user is marking messages as read, find messages from admin to user
    const filter = senderType === 'User' 
      ? { sender: conversationUserId, senderType: 'User', receiverType: 'Admin', isRead: false }
      : { receiver: conversationUserId, senderType: 'Admin', receiverType: 'User', isRead: false };
    
    const result = await Message.updateMany(filter, { isRead: true });
    console.log(`Marked ${result.modifiedCount} messages as read for conversation: ${conversationUserId}`);
    
    return result;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}