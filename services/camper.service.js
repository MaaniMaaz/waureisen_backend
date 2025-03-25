const Camper = require('../models/camper.model');

exports.getAllCampers = async () => {
  return await Camper.find().populate('owner');
};

exports.getCamperById = async (id) => {
  return await Camper.findById(id).populate('owner');
};

exports.createCamper = async (data) => {
  const newCamper = new Camper(data);
  return await newCamper.save();
};

exports.updateCamper = async (id, data) => {
  return await Camper.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCamper = async (id) => {
  await Camper.findByIdAndDelete(id);
};