// Has Relations
// 1. 1-M with Listings
// 2. 1-M with Transactions

// Manages (Admin will interact with these models by Role Based Access Control)
// Listings
// Transactions
// Travel Magazine
// Booking
// Filter
// User
// Priovider
// Voucher

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({

  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // TBD
  // An array of msgs from provider and user 
  crispCommunticationNotifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrispCommunicationNotification' 
  }],

  // TBD if needed or not 
  role: { type: String, default: 'admin' },

  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
