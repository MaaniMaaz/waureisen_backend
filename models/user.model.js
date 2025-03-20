// Has Relations
// 1. 1-M with Listings
// 2. 1-M with Transactions
// 3. 1-M with Reviews
// 4. 1-M with Booking

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  bio: { type: String, default: 'N/A' }, 
  stripeAccountId: { type: String, default: 'N/A' }, 
  phoneNumber: { type: String, required: true }, 

  profilePicture: { type: String, default: 'N/A' },

  // TBD - If needed or not -- was in Admin view of ShareTribe
  terms: { type: [String], required: true },

  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Uncomment the following line if you need to add `userType` to the model
// userType: { type: String, enum: ['customer', 'provider'], required: true },

const User = mongoose.model('User', userSchema);
module.exports = User;
