const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: {
    chf: { type: Number, default: 0 },
    eur: { type: Number, default: 0 }
  },

  // TBD 
  status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded', 'canceled', 'confirmed'], default: 'pending' },
  date: { type: Date, default: Date.now },
  method: { type: String, required: true },
  details: { type: String }
});

// Generate unique transaction ID
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const currentYear = new Date().getFullYear();
    
    // Find the highest transaction number for the current year
    const lastTransaction = await this.constructor.findOne({
      transactionId: new RegExp(`TRX-${currentYear}-`, 'i')
    }).sort({ transactionId: -1 });
    
    let nextNumber = 1;
    if (lastTransaction) {
      const lastNumber = parseInt(lastTransaction.transactionId.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    // Format the transaction ID (e.g., TRX-2025-001)
    this.transactionId = `TRX-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
