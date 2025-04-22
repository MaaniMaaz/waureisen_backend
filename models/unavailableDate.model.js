const mongoose = require('mongoose');

const unavailableDateSchema = new mongoose.Schema({
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing',
    required: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String,
    default: 'unavailable'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByType',
    required: true
  },
  createdByType: {
    type: String,
    enum: ['Provider', 'Admin'],
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index for listing + date to ensure uniqueness
unavailableDateSchema.index({ listing: 1, date: 1 }, { unique: true });

const UnavailableDate = mongoose.model('UnavailableDate', unavailableDateSchema);
module.exports = UnavailableDate;