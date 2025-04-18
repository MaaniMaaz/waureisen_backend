const mongoose = require('mongoose');

// Define filter schema with subsections and individual filters
const filterSchema = new mongoose.Schema({
  // Subsections are the main categories of filters (e.g., Basic Info, Amenities, etc.)
  subsections: [{
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String,
      trim: true
    },
    // Flag to indicate if this is a predefined subsection that shouldn't be deleted or modified
    predefined: {
      type: Boolean,
      default: false
    },
    // Filters are specific attributes within each subsection
    filters: [{
      name: { 
        type: String, 
        required: true,
        trim: true
      },
      type: { 
        type: String, 
        required: true,
        enum: ['text', 'number', 'checkbox', 'select', 'radio', 'file', 'date'],
        default: 'text'
      },
      // Flag to indicate if this is a predefined filter that shouldn't be deleted or modified
      predefined: {
        type: Boolean,
        default: false
      },
      required: {
        type: Boolean,
        default: false
      },
      // Options for select or radio types
      options: [{ 
        type: String,
        trim: true
      }],
      // For file/image type filters
      fileTypes: {
        type: String,
        default: 'image/*'
      }
    }]
  }],
  
  // For compatibility with existing code - these can be gradually migrated
  // to the new structure above
  generalFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }  // SVG icon as a string or URL
  }],
  mainFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  accomodationFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  kitchenFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  poolFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  wellnessFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  kidsFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  waterFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  cateringFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  parkingFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  viewFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  sportFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  smokingFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  accessibilityFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  descriptionFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  dogFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update the updatedAt timestamp
filterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-update middleware to update the updatedAt timestamp
filterSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Filter = mongoose.model('Filter', filterSchema);
module.exports = Filter;