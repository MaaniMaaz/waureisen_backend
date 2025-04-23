const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  phoneNumber: { type: String },

  profilePicture: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  displayName: { type: String },

  bio: { type: String },

  
  payoutDetails: {

    providerType: {
      type: String,
      enum: ['individual', 'company'],
    },

    country: { type: String },
  },
  
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],

  role: { type: String, default: 'provider' },

  profileStatus:{
    type: String,
    enum: ['not verified','pending verification', 'verified', 'banned'],
    default: 'not verified',
  } ,

  registrationStatus: {
    type: String,
    enum: ['incomplete', 'complete'],
    default: 'incomplete',
  },
  
  
  businessName: { type: String },
  businessType: { 
    type: String,
    enum: ['individual', 'company', 'property_manager'],
    default: 'individual'
  },
  vatNumber: { type: String },
  website: { type: String },
  
  
  bankName: { type: String },
  accountHolder: { type: String },
  iban: { type: String },
  swift: { type: String },
  
  
  hostingExperience: { 
    type: String,
    enum: ['none', 'other_platforms', 'professional'],
    default: 'none'
  },
  propertyCount: { 
    type: String,
    default: '1' 
  },
  heardAboutUs: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
