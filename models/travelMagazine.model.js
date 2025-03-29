// This model will handle blog posts in the travel magazine section

const mongoose = require('mongoose');

const tracelMagazineSchema = new mongoose.Schema({
  
  title: {
    content: { type: String, required: true },
    size: { type: String, enum: ['H1', 'H2'], required: true }
  },

  // Content
  content: { type: String, required: true },

  // TBD Can there be more categories?
  category: {
    type: String,
    enum: ['Destinations', 'Accomodations', 'Camping', 'Travel Tips', 'Fly', 'Ferry'],
    required: true
  },

  background: {
    color: { type: String },
    image: { type: String },
    imageOverlay: { 
      type: String, 
      enum: ['none', 'dark overlay', 'darker overlay'],
      default: 'none'
    },
    textColor: { type: String }
  },

  callToAction: {
    type: String,
    enum: ['none', 'internal link', 'external link'],
    default: 'none'
  },

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

  // Images Array
  images: [{ type: String }],

  status: {
    type: String,
    enum: ['draft', 'published', 'removed'],
    default: 'draft'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const travelMagazine = mongoose.model('travelMagazine', tracelMagazineSchema);
module.exports = travelMagazine;
