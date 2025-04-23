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

const mongoose = require("mongoose");

// Validator function to limit array size to 6
function arraySixLimit(val) {
  return val.length <= 6;
}

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // TBD branch
  // An array of msgs from provider and user
  crispCommunticationNotifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrispCommunicationNotification",
    },
  ],

  // Recommendation arrays - no validation at schema level
  topRecommendations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],

  popularAccommodations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],

  exclusiveFinds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],

  // TBD if needed or not
  role: { type: String, default: "admin" },

  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
