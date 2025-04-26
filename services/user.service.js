const User = require("../models/user.model");

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (id) => {
  return await User.findById(id).populate("bookings");
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

// Add this new method
exports.getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.getUserFavorites = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "favorites",
    populate: {
      path: "owner",
      select: "username email profilePicture",
    },
  });
  return user.favorites;
};

exports.addToFavorites = async (userId, listingId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: listingId } },
    { new: true }
  ).populate("favorites");
};

exports.removeFromFavorites = async (userId, listingId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: listingId } },
    { new: true }
  ).populate("favorites");
};

// Recently Viewed functions
exports.getRecentlyViewed = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "recentlyViewed",
    populate: {
      path: "owner",
      select: "username email profilePicture",
    },
  });
  return user.recentlyViewed;
};

exports.addToRecentlyViewed = async (userId, listingId) => {
  // First remove the listing if it already exists in the array
  await User.findByIdAndUpdate(userId, {
    $pull: { recentlyViewed: listingId },
  });

  // Then add it at the beginning (most recent)
  return await User.findByIdAndUpdate(
    userId,
    { $push: { recentlyViewed: { $each: [listingId], $position: 0 } } },
    { new: true }
  ).populate("recentlyViewed");
};

exports.removeFromRecentlyViewed = async (userId, listingId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { recentlyViewed: listingId } },
    { new: true }
  ).populate("recentlyViewed");
};
