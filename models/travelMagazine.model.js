const mongoose = require('mongoose');

// Schema for content elements (h1, h2, p, link, cta)
const contentElementSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['h1', 'h2', 'p', 'link', 'cta'],
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String,
    required: function() {
      return this.type === 'link' || this.type === 'cta';
    }
  }
}, { _id: true });

const travelMagazineSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
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
  country: { 
    type: String, 
  },
  category: {
    type: String,
    enum: ['Destinations', 'Food & Cuisine', 'Travel Tips', 'Pet Travel'],
    required: true
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
    enum: ['draft', 'published', 'removed'],
    default: 'published'
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
travelMagazineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-update middleware
travelMagazineSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const TravelMagazine = mongoose.model('TravelMagazine', travelMagazineSchema);
module.exports = TravelMagazine;