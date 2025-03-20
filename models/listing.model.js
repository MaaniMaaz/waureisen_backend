// Relations
// 1. 1-M with Transactions
// 2. 1-M with Reviews 

const mongoose = require('mongoose');

// Schema for the Listing Model
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' }, // GeoJSON type
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  price: { type: Number, required: true },

  availability: [{ type: Date }],
  
  status: {
    type: String,
    enum: ['active', 'pending approval', 'rejected', 'closed', 'deleted'],
    default: 'pending approval'
  },

  // Set According to the source and according to filters that user will add from the filter model 
  customFields: [{
    name: String,
    value: String
  }],

  cancellationPolicy: { type: String },
  
  // TBD if needed here or not - Option 2 is to have a separate model for reviews with a reference to the listing and user - Option 3 include reviews as a array in user model
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    review: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],

  source: {
    type: String,
    enum: ['waureisen', 'interhome', 'europarcs', 'bergkultur'],
    required: true
  },
  redirectLink: { type: String, default: null }, // Store URL if it’s from an external platform

  // TBD -- Will be a file 
  termsAndConditions: { type: String },

  // Model or Array? TBD
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],

  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  placeOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlaceOffer' }],
  dogFilters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DogFilter' }],
  details: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Detail' }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a geo-spatial index for location coordinates
listingSchema.index({ location: '2dsphere' });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
