// Has Relations
// 1. 1-M with Listings
// 2. 1-M with Transactions
// 3. 1-M with Reviews
// 4. 1-M with Booking

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  username: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  profilePicture: { type: String, default: 'N/A' },
  firstName: { type: String },
  lastName: { type: String },
  aboutYou: { type: String, default: 'N/A' }, 
  
  // Added missing fields from frontend
  dateOfBirth: { type: String, default: '' },
  nationality: { type: String, default: '' },
  gender: { type: String, default: '' },
  isProvider: { type: Boolean, default: false },
  
  // Newsletter subscription status
  newsletter: {
    type: String,
    enum: ['on', 'off'],
    default: 'off'
  },
  
  // Added dogs array
  dogs: [{
    name: { type: String, default: '' },
    gender: { type: String, default: '' }
  }],
  
  // Add travellers array to match frontend data
  travellers: [{
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    relationship: { type: String, default: '' }
  }],

  phoneNumber: { type: String }, 

  //TBD
  stripeAccountId: { type: String, default: 'N/A' }, 
  latestChargeId: { type: String, default: 'N/A' }, 

  // Payment Details
  paymentMethod: {
    cardNumber: { type: String, default: 'N/A' },
    cardHolderName: { type: String, default: 'N/A' },
    streetNumber: { type: String, default: 'N/A' },
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
  totalBookings: { 
    type: Number, 
    default: 0 
  },

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

  profileStatus:{
    type: String,
    enum: ['not verified','pending verification', 'verified', 'banned'],
    default: 'verified',
  } ,

  passwordResetToken: { type: String },
  passwordResetTokenExpires: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Uncomment the following line if you need to add `userType` to the model
// userType: { type: String, enum: ['customer', 'provider'], required: true },

const User = mongoose.model('User', userSchema);
module.exports = User;


// Generate unique 6-digit customer number
userSchema.pre('save', async function(next) {
  if (!this.customerNumber) {
    let isUnique = false;
    let customerNumber;
    
    while (!isUnique) {
      // Generate random 6-digit number
      customerNumber = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if number already exists
      const existingUser = await this.constructor.findOne({ customerNumber });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    this.customerNumber = customerNumber;
  }
  next();
});
