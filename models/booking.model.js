// Updated booking model to ensure capacity and bookingId are properly defined
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },

  type: { 
    type: String, 
    enum: ['booking', 'appointment'], 
    default: 'booking' 
  },

  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },


  isPayoutReleased: { type: Boolean, default:false  },

  currency: { type: String, required: true },
  reciept: { type: String, required: true },
  paymentIntentId: { type: String, required: true },
  providerAccountId: { type: String, required: true },

  // TBD if needed or not

  // Added capacity object with people and dogs fields
  capacity: {
    people: { type: Number, default: 1 },
    dogs: { type: Number, default: 0 }
  },

  // Add bookingId field for reference
  bookingId: { type: String },

  // Other fields
  totalPrice: { type: Number, required: true },
  appliedVoucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },

  // For appointments
  appointmentTime: { type: Date },
  appointmentType: { 
    type: String,
    enum: ['viewing', 'consultation', 'other']
  },
  appointmentNotes: { type: String },

  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'canceled'], 
    default: 'pending' 
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate a unique booking ID on creation if one isn't provided
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId && this.isNew) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `WR-${year}-${randomNum}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;