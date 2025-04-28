const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const bookingController = require("../controllers/booking.controller");
const voucherController = require("../controllers/voucher.controller");
const { verifyToken } = require("../middlewares/auth");
const { isUser } = require("../middlewares/role");

// Auth routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);

// Protected routes
// Add these routes before other user routes
router.get("/profile", verifyToken, userController.getUserProfile);
router.put("/profile", verifyToken, userController.updateUserProfile);
// Security route for password update
router.put("/security", verifyToken, isUser, userController.updateUserSecurity);

// Favorites routes - moved before other user routes to fix path conflicts
router.get(
  "/favorites",
  verifyToken,
  isUser,
  userController.getFavoriteListings
);
router.post(
  "/favorites/:listingId",
  verifyToken,
  isUser,
  userController.addToFavorites
);
router.delete(
  "/favorites/:listingId",
  verifyToken,
  isUser,
  userController.removeFromFavorites
);

// Recently Viewed routes
router.get(
  "/recently-viewed",
  verifyToken,
  isUser,
  userController.getRecentlyViewedListings
);
router.post(
  "/recently-viewed/:listingId",
  verifyToken,
  isUser,
  userController.addToRecentlyViewed
);
router.delete(
  "/recently-viewed/:listingId",
  verifyToken,
  isUser,
  userController.removeFromRecentlyViewed
);

// Protected routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", verifyToken, userController.updateUser);
router.delete("/:id", verifyToken, userController.deleteUser);

// Booking Management Routes
// Make sure to send all things according to model
router.post("/bookings", verifyToken, isUser, bookingController.createBooking);
router.get(
  "/my-bookings",
  verifyToken,
  isUser,
  bookingController.getUserBookings
);
router.get(
  "/bookings/:id",
  verifyToken,
  isUser,
  bookingController.getBookingById
);
router.put(
  "/bookings/:id/cancel",
  verifyToken,
  isUser,
  bookingController.cancelBooking
);

// Voucher Routes
// TBD do in frontend and send final to backend ?
router.post(
  "/apply-voucher",
  verifyToken,
  isUser,
  voucherController.applyVoucher
);
router.get(
  "/valid-vouchers",
  verifyToken,
  isUser,
  voucherController.getValidVouchers
);

// Appointment Routes
// TBD other Website to be used
router.post(
  "/appointments",
  verifyToken,
  isUser,
  bookingController.createAppointment
);
router.get(
  "/my-appointments",
  verifyToken,
  isUser,
  bookingController.getUserAppointments
);
router.put(
  "/appointments/:id/cancel",
  verifyToken,
  isUser,
  bookingController.cancelAppointment
);

// Trip Management Routes
router.get("/trips", verifyToken, isUser, userController.getUserTrips);
router.get(
  "/reviewed-bookings",
  verifyToken,
  isUser,
  userController.getReviewedBookings
);

// Newsletter subscription routes
router.post(
  "/subscribe/:newsletterId",
  verifyToken,
  isUser,
  userController.subscribeToNewsletter
);
router.delete(
  "/unsubscribe/:newsletterId",
  verifyToken,
  isUser,
  userController.unsubscribeFromNewsletter
);
router.get(
  "/subscriptions",
  verifyToken,
  isUser,
  userController.getNewsletterSubscriptions
);

module.exports = router;
