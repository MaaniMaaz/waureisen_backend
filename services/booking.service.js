const Booking = require('../models/booking.model');

exports.getAllBookings = async () => {
  return await Booking.find().populate('user').populate('listing');
};

exports.getBookingById = async (id) => {
  return await Booking.findById(id).populate('user').populate('listing');
};

exports.createBooking = async (data) => {
  const newBooking = new Booking(data);
  return await newBooking.save();
};

exports.updateBooking = async (id, data) => {
  return await Booking.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteBooking = async (id) => {
  await Booking.findByIdAndDelete(id);
};
