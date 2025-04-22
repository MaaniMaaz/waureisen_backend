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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
