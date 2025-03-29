const mongoose = require('mongoose');

const emailNotificationSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // TBD can be more 
  type: { 
    type: String, 
    required: true,
    // There can be many types of email notifications
    //enum: ['registration', 'confirmation', 'verification', 'login', 'booking', 'custom']
  },

  subject: { type: String, required: true },
  template: { type: String, required: true },
  variables: [{ type: String }],
  isActive: { type: Boolean, default: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EmailNotification = mongoose.model('EmailNotification', emailNotificationSchema);
module.exports = EmailNotification;