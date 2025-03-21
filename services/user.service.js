const User = require('../models/user.model');

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (id) => {
  return await User.findById(id).populate('bookings');
};

exports.createUser = async (data) => {
  const newUser = new User(data);
  return await newUser.save();
};

exports.updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};
