const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },

  discountPercentage: { type: Number, required: true },
  
  discountMoney: {
    chf: { type: Number, default: 0 },
    eur: { type: Number, default: 0 }
  },

  travelAmount: {
    amount: { type: Number, default: 0 },
    currency: { type: String, enum: ['CHF', 'EUR'], default: 'CHF' }
  },

  validUntil: { type: Date },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },

  voucherBy:{
    type: String,
    enum: ['admin', 'provider'],
    required: true
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }  
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
