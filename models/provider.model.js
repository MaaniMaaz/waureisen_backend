const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  role: { type: String, default: 'provider' },
  createdAt: { type: Date, default: Date.now }
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
