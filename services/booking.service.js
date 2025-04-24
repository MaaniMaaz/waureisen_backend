// booking.service.js - Make sure this is properly implemented

const Booking = require("../models/booking.model");
const UnavailableDate = require("../models/unavailableDate.model");

exports.getAllBookings = async () => {
  return await Booking.find().populate("user").populate("listing");
};

exports.getBookingById = async (id) => {
  return await Booking.findById(id).populate("user").populate("listing");
};

exports.createBooking = async (data) => {
  // to check if the listing is available for the selected dates or is that specific listing is blocked on that specific date by that specific provider
  await validateBookingDates(data.listing, data.checkInDate, data.checkOutDate);
console.log(data);

  const newBooking = new Booking(data);
  return await newBooking.save();
};

exports.updateBooking = async (id, data) => {
  return await Booking.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteBooking = async (id) => {
  await Booking.findByIdAndDelete(id);
};

exports.getBookingsByUser = async (userId) => {
  return await Booking.find({ user: userId, type: "booking" })
    .populate("listing")
    .populate("appliedVoucher");
};

exports.getAppointmentsByUser = async (userId) => {
  return await Booking.find({ user: userId, type: "appointment" }).populate(
    "listing"
  );
};

exports.getBookingsByUserAndDateRange = async (userId, currentDate, type) => {
  const query = {
    user: userId,
    type: "booking",
  };

  if (type === "upcoming") {
    query.checkInDate = { $gte: currentDate };
  } else {
    query.checkOutDate = { $lt: currentDate };
  }

  return await Booking.find(query)
    .populate("listing")
    .populate("appliedVoucher")
    .sort({ checkInDate: type === "upcoming" ? 1 : -1 });
};

exports.getReviewedBookings = async (userId) => {
  return await Booking.find({
    user: userId,
    type: "booking",
    review: { $exists: true },
  })
    .populate("listing")
    .populate("review")
    .sort({ checkOutDate: -1 });
};

// Add a more robust method to get bookings for a provider
exports.getBookingsByProvider = async (
  providerId,
  status = "all",
  limit = null
) => {
  // First find all listings owned by this provider
  const Listing = require("../models/listing.model");

  const listings = await Listing.find({
    owner: providerId,
    ownerType: "Provider",
  });

  if (!listings || listings.length === 0) {
    return [];
  }

  const listingIds = listings.map((listing) => listing._id);

  // Build query
  const query = {
    listing: { $in: listingIds },
  };

  if (status !== "all") {
    query.status = status;
  }

  // Create query builder
  let bookingsQuery = Booking.find(query)
    .populate("user")
    .populate("listing")
    .sort({ createdAt: -1 });

  // Apply limit if needed
  if (limit && !isNaN(parseInt(limit))) {
    bookingsQuery = bookingsQuery.limit(parseInt(limit));
  }

  return await bookingsQuery.exec();
};

const validateBookingDates = async (listingId, checkInDate, checkOutDate) => {
  const unavailableDates = await UnavailableDate.find({
    listing: listingId,
    date: {
      $gte: new Date(checkInDate),
      $lte: new Date(checkOutDate),
    },
  });

  if (unavailableDates.length > 0) {
    throw new Error("Some selected dates are unavailable for booking");
  }

  return true;
};
