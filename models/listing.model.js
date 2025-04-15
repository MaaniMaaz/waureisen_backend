// Relations
// 1. 1-M with Transactions
// 2. 1-M with Reviews 

const mongoose = require('mongoose');
const { totalmem } = require('os');


const listingSchema = new mongoose.Schema({

  listingType: {
    type: String,
    //required: true 
  },

  title: { type: String}, //required: true },
  description: { type: String },

  checkInTime: { type: Date },
  checkOutTime: { type: Date },

  location: {
    address : {
     type: String,
     required: true 
    },

    // TBD -- Apt, suite, building
    optional: { type : String},

    // TBD -- calculate or find coordinates from address
    type: { type: String, enum: ['Point'], default: 'Point' }, // GeoJSON type
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },


  pricePerNight: { 
    price: { type: Number, required: true },
    currency: { type: String, required: true }
  }, 
  
  // Optional -- Can Be Empty or Array
  specialPrices: [{
    pricePerNight: {
      price: { type: Number },
      currency: { type: String }
    },
    startDate: { type: Date },
    endDate: { type: Date }
  }],

  additionalServices: [
    {
     serviceTitle: { type: String },
     priceofService: {
      price: { type: Number },
      currency: { type: String } 
     },
     chargesAccordingTo: {
      type: String,
      enum: ['Per night', 'Per stay'],
     },
     
     type: {
      type: String,
      enum: ['Mandatory', 'Included' , 'Optional'],
     },
    }
  ],

  availability: [{ 
    timeZone: { type: String },
    weeklyDefaultSchedule: [{ 
      day: { 
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      // TBD
      // available: { type: Boolean, default: true },
      // openTime: { type: String },  // Format: "HH:mm"
      // closeTime: { type: String }  // Format: "HH:mm"
    }]
  }],
  
  // TBD
  status: {
    type: String,
    enum: ['draft','active', 'pending approval', 'rejected', 'closed', 'deleted'],
    default: 'pending approval'
  },

  // TBD -- As we have all now in filters model -- Set According to the source and according to filters that user will add from the filter model 
  // customFields: [{
  //   name: String,
  //   value: String
  // }],

  // Documents 

  legal : {
    cancellationPolicy: { type: String },

      // TBD -- Will be a file 
      termsAndConditions: { type: String },


    
  },

  
  // TBD if needed here or not - Option 2 is to have a separate model for reviews with a reference to the listing and user - Option 3 include reviews as a array in user model
  // reviews: [{
  //   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  //   review: { type: String },
  //   rating: { type: Number, min: 1, max: 5 },
  //   createdAt: { type: Date, default: Date.now }
  // }],

  // TBD
  source:{
    name: {
      type: String,
      enum: ['waureisen', 'interhome', 'europarcs', 'bergkultur'],
      required: true,
      default: 'waureisen',
    },
    redirectLink: { type: String, default: null }, // Store URL if it's from an external platform  
  },

  // Model or Array? TBD
  // photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  images: [{ type: String }], // Store URLs if it's from an external platform

  // Owner reference (either admin or provider, but not both)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
    refPath: 'ownerType'
  },
  ownerType: {
    type: String,
    //required: true,
    enum: ['Admin', 'Provider']
  },

  provider: {
    type: String,
    enum: ['Waureisen', 'Interhome', 'Europarcs', 'Bergkultur'],
    default: 'WaureisenD'
  },

  // Selected filters for the listing -- TBD if we need to save icon or not
  selectedFilters: {
    generalFilters: [{ name: String, icon: String }],
    mainFilters: [{ name: String, icon: String }],
    accomodationFilters: [{ name: String, icon: String }],
    kitchenFilters: [{ name: String, icon: String }],
    poolFilters: [{ name: String, icon: String }],
    wellnessFilters: [{ name: String, icon: String }],
    kidsFilters: [{ name: String, icon: String }],
    waterFilters: [{ name: String, icon: String }],
    cateringFilters: [{ name: String, icon: String }],
    parkingFilters: [{ name: String, icon: String }],
    viewFilters: [{ name: String, icon: String }],
    sportFilters: [{ name: String, icon: String }],
    smokingFilters: [{ name: String, icon: String }],
    accessibilityFilters: [{ name: String, icon: String }],
    descriptionFilters: [{ name: String, icon: String }],
    dogFilters: [{ name: String, icon: String }]
  },

  // Analytics
  totalViews: { type: Number, default: 0 }, // Number of views
  totalBookings: { type: Number, default: 0 }, // Number of bookings
  totalReviews: { type: Number, default: 0 }, // Number of reviews
  totalRating: { type: Number, default: 0 }, // Total rating
  averageRating: { type: Number, default: 0 }, // Average rating

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a geo-spatial index for location coordinates
listingSchema.index({ location: '2dsphere' });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
