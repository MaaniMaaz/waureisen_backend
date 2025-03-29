// TBD if needed seperately or just fetch from user 

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

  type: { 
    type: String, 
    enum: ['booking', 'appointment'], 
    default: 'booking' 
  },

  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },

  // TBD if needed or not
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

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
