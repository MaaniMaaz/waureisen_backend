const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  subscribers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  category: {
    type: String,
    enum: ['general', 'promotions', 'travel_tips', 'new_listings'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date
  },
  sentDate: {
    type: Date
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

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
module.exports = Newsletter;