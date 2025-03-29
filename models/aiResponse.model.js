const mongoose = require('mongoose');

const aiResponseSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true,
    unique: true 
  },
  answer: { 
    type: String, 
    required: true 
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'listing', 'general'],
    default: 'general'
  },
  keywords: [String],
  needsHumanSupport: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

aiResponseSchema.index({ keywords: 1 });
aiResponseSchema.index({ category: 1 });

const AIResponse = mongoose.model('AIResponse', aiResponseSchema);
module.exports = AIResponse;