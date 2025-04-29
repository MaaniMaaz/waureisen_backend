// THis script updates all filters in Subsection Amenities with Subsubsections.
// All names update with proper spacing and first capital letter 

const mongoose = require('mongoose');
require('dotenv').config();
const Filter = require('../../../../models/filter.model');

const MONGO_URI = "mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025?retryWrites=true&w=majority&appName=ClusterWork";

function formatKey(key) {
  if (key === 'facilitiesview') return 'Facilities View';
  if (key === 'facilitiestodonearby') return 'Facilities To Do Nearby';
  if (key === 'facilitiessport') return 'Facilities Sport';
  if (key === 'facilitiessmoking') return 'Facilities Smoking';
  if (key === 'facilitiesmainfilters') return 'Facilities Main Filters';
  if (key === 'facilitieskitchen') return 'Facilities Kitchen';
  if (key === 'facilitieskids') return 'Facilities Kids';
  if (key === 'facilitiesaccommodationfeatures') return 'Facilities Accommodation Features';
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatValue(value) {
  if (value === 'privategarden') return 'Private Garden';
  if (value === 'Noleashrequired') return 'No Leash Required';
  if (value === 'fencedgarden1') return 'Fenced Garden 1';
  if (value === 'fencedterrace') return 'Fenced Terrace';
  if (value === 'dogstaysfreeofcharge') return 'Dog Stays Free of Charge';
  if (value === 'fencedgarden120') return 'Fenced Garden';
  if (value === 'off-leashmeadow') return 'Off-leash Meadow';
  if (value === 'Dog-friendlybeachnearby') return 'Dog-friendly Beach Nearby';
  if (value === 'dog-friendlyrestaurants') return 'Dog-friendly Restaurants';
  if (value === 'Fireworkfreezone') return 'Firework Free Zone';
  if (value === 'allowedatthepoolarea') return 'Allowed at the Pool Area';
  if (value === 'fencedgarden150') return 'Fenced Garden 150';
  if (value === 'leashrequired') return 'Leash Required';
  if (value === 'fencedgarden2') return 'Fenced Garden 2';
  if (value === 'poopbagsforfree') return 'Poop Bags for Free';
  if (value === 'dogschool') return 'Dog School';
  if (value === 'organizedhikingtourswithdogs') return 'Organized Hiking Tours with Dogs';
  if (value === 'foodbowl') return 'Food Bowl';
  if (value === 'waterbowl') return 'Water Bowl';
  if (value === 'dogbed') return 'Dog Bed';
  if (value === 'fenceddogpark') return 'Fenced Dog Park';
  if (value === 'servicedog') return 'Service Dog';
  if (value === 'allowedintherestaurant') return 'Allowed in the Restaurant';
  if (value === 'parkingattheaccommodation') return 'Parking at the Accommodation';
  if (value === 'parkingstreet') return 'Parking Street';
  if (value === 'freewifi') return 'Free Wifi';
  if (value === 'nocarpet') return 'No Carpet';
  if (value === 'otherresidentsinthebuilding') return 'Other Residents in the Building';
  if (value === 'additionalbed') return 'Additional Bed';
  if (value === 'combinationlock') return 'Combination Lock';
  if (value === 'airconditioner') return 'Air Conditioner';
  if (value === 'kidsfriendly') return 'Kids Friendly';
  if (value === 'babybed') return 'Baby Bed';
  if (value === 'kidschair') return 'Kids Chair';
  if (value === 'childrenplayground') return 'Children Playground';
  if (value === 'kidspool') return 'Kids Pool';
  if (value === 'fencedgarden') return 'Fenced Garden';
  if (value === 'privatepool') return 'Private Pool';
  if (value === 'dogallowedintherestaurant') return 'Dog Allowed in the Restaurant';
  if (value === 'freecancellation') return 'Free Cancellation';
  if (value === 'nonsmokingaccommodation') return 'Non Smoking Accommodation';
  if (value === 'smokingaccommodation') return 'Smoking Accommodation';
  if (value === 'hikingtour') return 'Hiking Tour';
  if (value === 'bicyclepath') return 'Bicycle Path';
  if (value === 'biketour') return 'Bike Tour';
  if (value === 'horseriding') return 'Horse Riding';
  if (value === 'bicyclerental') return 'Bicycle Rental';
  if (value === 'minigolf') return 'Mini Golf';
  if (value === 'fitnesscenter') return 'Fitness Center';
  if (value === 'crosscountryskiing') return 'Cross Country Skiing';
  if (value === 'beachvolley') return 'Beach Volley';
  if (value === 'tabletennis') return 'Table Tennis';
  if (value === 'suprental') return 'Sup Rental';
  if (value === 'gardenview') return 'Garden View';
  if (value === 'seaview') return 'Sea View';
  if (value === 'poolview') return 'Pool View';
  if (value === 'mountainview') return 'Mountain View';
  if (value === 'lakeview') return 'Lake View';
  if (value === 'backingoven') return 'Backing Oven';
  if (value === 'coffeemachine') return 'Coffee Machine';
  if (value === 'nespressomachine') return 'Nespresso Machine';
  if (value === 'washingmachine') return 'Washing Machine';
  if (value === 'standalone') return 'Stand Alone';
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

async function updateFilters() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const filters = await Filter.find({});

    for (const filter of filters) {
      const amenitiesSubsection = filter.subsections.find(sub => sub.name === 'Amenities');
      if (amenitiesSubsection) {
        amenitiesSubsection.subsubsections.forEach(subsubsection => {
          subsubsection.name = formatKey(subsubsection.name);
          subsubsection.filters.forEach(filter => {
            filter.name = formatValue(filter.name);
          });
        });
        await filter.save();
      }
    }

    console.log('Filters updated successfully');
  } catch (error) {
    console.error('Error updating filters:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateFilters();