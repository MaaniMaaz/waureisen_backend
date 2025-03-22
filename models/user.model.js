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

  profilePicture: { type: String, default: 'N/A' },
  firstName: { type: String },
  lastName: { type: String },
  aboutYou: { type: String, default: 'N/A' }, 
  

  phoneNumber: { type: String, required: true }, 

  //TBD
  stripeAccountId: { type: String, default: 'N/A' }, 

  // Payment Details
  paymentMethod: {
    cardNumber: { type: String, default: 'N/A' },
    cardHolderName: { type: String, default: 'N/A' },
    street: { type: String, default: 'N/A' },
    optional: { type: String, default: 'N/A' },
    postalCode: { type: String, default: 'N/A' },
    city: { type: String, default: 'N/A' },
    state: { type: String, default: 'N/A' },
    country: { type: String, default: 'N/A' },

    // TBD Other Info Missing in frontend
    expiryDate: { type: String, default: 'N/A' },
  },

  // TBD - If needed or not -- was in Admin view of ShareTribe
  terms: { type: [String], required: true },

  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Uncomment the following line if you need to add `userType` to the model
// userType: { type: String, enum: ['customer', 'provider'], required: true },

const User = mongoose.model('User', userSchema);
module.exports = User;
