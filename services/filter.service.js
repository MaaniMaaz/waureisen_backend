const Filter = require('../models/filter.model');

exports.getAllFilters = async () => {
  return await Filter.find();
};

exports.getFilterById = async (id) => {
  return await Filter.findById(id);
};

exports.createFilter = async (data) => {
  const newFilter = new Filter(data);
  return await newFilter.save();
};

exports.updateFilter = async (id, data) => {
  return await Filter.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteFilter = async (id) => {
  await Filter.findByIdAndDelete(id);
};
