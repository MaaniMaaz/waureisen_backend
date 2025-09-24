const mongoose = require('mongoose');

// Schema for content elements (h1, h2, p, link, cta)
const contentElementSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['h1', 'h2', 'p', 'link', 'cta' , 'img'],
    required: true 
  },
  text: { 
    type: String, 
    // required: true 
  },
  url: { 
    type: String,
    required: function() {
      return this.type === 'link' || this.type === 'cta';
    }
  }
}, { _id: true });

const camperSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true ,
    unique:true
  },
  description: { 
    type: String, 
    required: true 
  },
  metaTitle: { 
    type: String, 
    required: true ,
  },
  metaDescription: { 
    type: String, 
    required: true 
  },
  category: {
    type: [String],
    required: false
  },
  featuredImage: { 
    type: String,  // Cloudinary URL
    required: true
  },
  imageTitle: { 
    type: String  // Overlay text on the featured image
  },
  content: [contentElementSchema],
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Coming Soon', 'Unavailable'],
    default: 'Available'
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'CHF'
  },
  location: {
    type: String,
    required: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  excerpt: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to update timestamps
camperSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-update middleware
camperSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Camper = mongoose.model('Camper', camperSchema);
module.exports = Camper;