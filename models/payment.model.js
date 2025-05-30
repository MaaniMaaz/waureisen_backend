const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking' 
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        enum: ['CHF', 'EUR', 'USD'],
        default: 'EUR',
        required: true
    },
    status: {
        type: String,
        enum: ["success", "failed", "pending", "refunded", "canceled"],
        default: "pending"
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    method: {
        type: String,
        enum: ["card", "bank_transfer", "paypal"],
        default: "card"
    },
    details: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    },
    isRefund: {
        type: Boolean,
        default: false
    },
    // Additional fee breakdown for transparency
    fees: {
        stripeFee: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        providerAmount: { type: Number, default: 0 }
    },
    // Metadata for additional information
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Index for faster queries
paymentSchema.index({ userId: 1, date: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;