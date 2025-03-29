// TBD - check conformance and attributes required or not 

const mongoose = require('mongoose');

const camperSchema = new mongoose.Schema({
    
  title: { type: String, required: true },
  
  description: { type: String, required: true },

  image1: { type: String, required: true },
  image2: { type: String, required: true },

  // This represents each para 
  features:{
    title: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    image: [{ type: String }], 
  },
  
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Camper = mongoose.model('Camper', camperSchema);
module.exports = Camper;

// const mongoose = require('mongoose');

// const camperSchema = new mongoose.Schema({

//     name: { type: String, required: true },
//     model: { type: String, required: true },
//     year: { type: Number, required: true },

//     description: { type: String, required: true },
//     specifications: {
//         length: { type: Number, required: true }, // in meters
//         capacity: { type: Number, required: true }, // number of people
//         beds: { type: Number, required: true }
//     },

//     amenities: [{
//         type: String,
//         enum: ['bathroom', 'kitchen', 'ac', 'heating', 'tv', 'wifi', 'shower', 'fridge']
//     }],

//     images: [{ type: String }], // URLs to images

//     dailyRate: { type: Number, required: true },
//     location: {
//         city: { type: String, required: true },
//         country: { type: String, required: true },
//         coordinates: {
//             latitude: { type: Number },
//             longitude: { type: Number }
//         }
//     },

//     status: {
//         type: String,
//         enum: ['available', 'booked', 'maintenance', 'inactive'],
//         default: 'available'
//     },

//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },

//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }
// });

// const Camper = mongoose.model('Camper', camperSchema);
// module.exports = Camper;