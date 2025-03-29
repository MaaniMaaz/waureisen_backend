const Listing = require('../models/listing.model');

exports.getAllListings = async () => {
  return await Listing.find().populate('owner');
};

exports.getListingById = async (id) => {
  return await Listing.findById(id).populate('owner');
};

exports.createListing = async (data) => {
  const newListing = new Listing(data);
  return await newListing.save();
};

exports.updateListing = async (id, data) => {
  return await Listing.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteListing = async (id) => {
  await Listing.findByIdAndDelete(id);
};
