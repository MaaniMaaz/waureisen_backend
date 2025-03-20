const mongoose = require('mongoose');

const filterSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // General Filters on Details Page like Max Person, No of bathrooms, No of Kitchen, etc.
  generalFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }  // SVG icon as a string or URL
  }],

  // Main Filters options:
  // "Dog allowed in the restaurant", "Parking at the accommodation", "Free cancellation", "Private pool", "Kids friendly"
  mainFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  
  // Accommodation Features:
  // "TV", "Free Wi-Fi", "No carpet floor", "Balcony", "Terrace", "Kitchen", "Grill", "Fireplace", 
  // "Standalone accommodation", "Combination lock (entry without a person)", "Air conditioner", 
  // "Home cinema", "Additional bed", "Other residents in the building", "Ski room", "Washing machine"
  accomodationFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  
  // Kitchen Facilities:
  // "Dishwasher", "Microwave", "Baking oven", "Coffee machine", etc.
  kitchenFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Pool Features:
  // "Shared pool", "Private pool", "Private whirlpool", "Heated pool", "Outdoor pool", "Indoor pool", "Whirlpool"
  poolFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Wellness / Spa / Pool:
  // "Massages", "Relaxation zone", "Sauna", "Thermal bath", "Aqua-Fitt", "Steam bath", "Hamam"
  wellnessFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // For the Kids:
  // "Kids friendly", "Kids chair", "Baby bed", "Children's playground", "Kids pool"
  kidsFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Water Nearby:
  // "Lake", "Sea", "River"
  waterFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Catering:
  // "Breakfast", "Half board", "Three-quarter board", "Full board", "All-inclusive"
  cateringFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Parking Features:
  // "E-charge", "Outdoor parking", "Underground", "Parking at the accommodation", "Parking options on the street"
  parkingFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // View Features:
  // "Sea view", "Pool view", "Garden view", "Lake view", "Mountain view"
  viewFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Sport Features:
  // "Fitness center", "Fitness trainer", "Yoga", "Golf", "Minigolf", "Tennis", "Table tennis", 
  // "Soccer", "Bicycle rental", "SUP rental", "Skiing", "Cross-country skiing", "Beach Volley", 
  // "Hiking tour", "Bicycle path", "Bike tour", "Horse riding", "Surf"
  sportFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Smoking:
  // "Non-smoking accommodation", "Smoking accommodation"
  smokingFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  // Accessibility:
  // "Barrier-free guest entrance", "Guest entrance is wider than 81cm", "Ceiling or mobile lift", 
  // "Step-free access to the bedroom", "Step-free access to the bathroom", 
  // "Accessible elevator in the accommodation", "Elevator directly into the apartment", 
  // "Elevator directly at the apartment door"
  accessibilityFilters: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Filter = mongoose.model('Filter', filterSchema);
module.exports = Filter;
