const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  validUntil: { type: Date },
  status: { type: String, enum: ['active', 'expired'], default: 'active' }
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
