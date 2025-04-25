//This file takes unique filters json file with all nuique filters from interhome json
// and formats names with spacing and capital first letter and saves it to a new file formatted_unique_filters.json
const fs = require('fs');

const inputFilePath = 'c:\\Users\\wiki8\\Desktop\\Nova\\@Waureisen\\waureisen_backend\\scripts\\New-Sharetribe\\Scripts\\Script v2\\unique_filters.json';
const outputFilePath = 'c:\\Users\\wiki8\\Desktop\\Nova\\@Waureisen\\waureisen_backend\\scripts\\New-Sharetribe\\Scripts\\Script v2\\formatted_unique_filters.json';

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
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatJson(data) {
  const formatted = {};
  for (const [key, values] of Object.entries(data)) {
    const formattedKey = formatKey(key);
    formatted[formattedKey] = values.map(formatValue);
  }
  return formatted;
}

fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) throw err;
  const jsonData = JSON.parse(data);
  const formattedData = formatJson(jsonData);
  fs.writeFile(outputFilePath, JSON.stringify(formattedData, null, 2), 'utf8', (err) => {
    if (err) throw err;
    console.log('Formatted JSON saved to', outputFilePath);
  });
});