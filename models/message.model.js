const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType',
    required: true 
  },
  senderType: {
    type: String,
    enum: ['User', 'Provider', 'Admin'],  // Capital letters for user types
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiverType',
    required: true
  },
  receiverType: {
    type: String,
    enum: ['User', 'Provider', 'Admin'],  // Capital letters for user types
    required: true
  },
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing',
    required: function() {
      return this.messageType === 'listing';
    }
  },
  messageType: {
    type: String,
    enum: ['listing', 'support', 'chatbot'],
    required: true
  },
  content: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  supportTicket: {
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open'
    },
    category: {
      type: String,
      enum: ['booking', 'payment', 'technical', 'other'],
      default: 'other'
    }
  },
  chatbotContext: {
    previousMessages: [{
      role: String,
      content: String
    }],
    intent: String,
    resolved: {
      type: Boolean,
      default: false
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ listing: 1 });
messageSchema.index({ messageType: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;