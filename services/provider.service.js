const mongoose = require('mongoose');
const Provider = require('../models/provider.model'); // Adjust path as needed
// If you're using User model instead of a separate Provider model
// const User = require('../models/user.model');

// Get all providers
exports.getAllProviders = async () => {
  const providers = await Provider.find();
  return providers;
};

// Get provider by ID
exports.getProviderById = async (id) => {
  // Check if the ID is a valid MongoDB ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid provider ID format');
  }
  const provider = await Provider.findById(id);
  return provider;
};

// Get provider by email
exports.getProviderByEmail = async (email) => {
  const provider = await Provider.findOne({ email });
  return provider;
};

// Create a new provider
exports.createProvider = async (providerData) => {
  const newProvider = new Provider(providerData);
  return await newProvider.save();
};

// Update a provider
exports.updateProvider = async (id, updateData) => {
  // Check if the ID is a valid MongoDB ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid provider ID format');
  }
  const updatedProvider = await Provider.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  return updatedProvider;
};

// Delete a provider
exports.deleteProvider = async (id) => {
  // Check if the ID is a valid MongoDB ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid provider ID format');
  }
  await Provider.findByIdAndDelete(id);
  return;
};
