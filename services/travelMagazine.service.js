const TravelMagazine = require('../models/travelMagazine.model');

exports.getAllTravelMagazines = async () => {
  return await TravelMagazine.find().populate('author');
};

exports.getTravelMagazineById = async (id) => {
  return await TravelMagazine.findById(id).populate('author');
};

exports.createTravelMagazine = async (data) => {
  const newTravelMagazine = new TravelMagazine(data);
  return await newTravelMagazine.save();
};

exports.updateTravelMagazine = async (id, data) => {
  return await TravelMagazine.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteTravelMagazine = async (id) => {
  await TravelMagazine.findByIdAndDelete(id);
};
