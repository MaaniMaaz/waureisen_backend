// This model will handle blog posts in the travel magazine section

const mongoose = require('mongoose');

const tracelMagazineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

  // Images Array
  images: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const travelMagazine = mongoose.model('travelMagazine', tracelMagazineSchema);
module.exports = travelMagazine;
