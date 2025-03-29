const Provider = require('../models/provider.model');

exports.getAllProviders = async () => {
  return await Provider.find();
};

exports.getProviderById = async (id) => {
  return await Provider.findById(id).populate('listings');
};

exports.createProvider = async (data) => {
  const newProvider = new Provider(data);
  return await newProvider.save();
};

exports.updateProvider = async (id, data) => {
  return await Provider.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteProvider = async (id) => {
  await Provider.findByIdAndDelete(id);
};

// Add this new method
exports.getProviderByEmail = async (email) => {
    return await Provider.findOne({ email });
};
