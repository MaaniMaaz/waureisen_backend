const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");
const { isProvider } = require("../middlewares/role");
const providerController = require("../controllers/provider.controller");
const providerProfileController = require("../controllers/provider.profile.controller");

// Auth routes (no authentication required)
router.post("/signup", providerController.signup);
router.post("/login", providerController.login);

router.post(
  "/complete-registration",
  verifyToken,
  isProvider,
  providerController.completeRegistration
);

// Profile routes
router.get(
  "/profile",
  verifyToken,
  isProvider,
  providerProfileController.getProviderProfile
);
router.put(
  "/profile",
  verifyToken,
  isProvider,
  providerProfileController.updateProviderProfile
);

// New account-related routes
router.put(
  "/profile/banking",
  verifyToken,
  isProvider,
  providerProfileController.updateProviderBanking
);
router.put(
  "/profile/security",
  verifyToken,
  isProvider,
  providerProfileController.updateProviderSecurity
);
// Listings Management
router.get(
  "/listings",
  verifyToken,
  isProvider,
  providerProfileController.getProviderListings
);
router.get(
  "/listings/:id",
  verifyToken,
  isProvider,
  providerController.getListingDetails
);

// Analytics & Dashboard
router.get(
  "/analytics",
  verifyToken,
  isProvider,
  providerProfileController.getProviderAnalytics
);

// Provider adds a new listing
router.post(
  "/add-listing",
  verifyToken,
  isProvider,
  providerController.addListing
);
router.put(
  "/listings/:id",
  verifyToken,
  isProvider,
  providerController.updateListing
);
router.delete(
  "/listings/:id",
  verifyToken,
  isProvider,
  providerController.deleteProviderListing
);

// Bookings Management
router.get(
  "/bookings",
  verifyToken,
  isProvider,
  providerProfileController.getProviderBookings
);
router.get(
  "/bookings/:id",
  verifyToken,
  isProvider,
  providerController.getBookingDetails
);
router.put(
  "/bookings/:id/accept",
  verifyToken,
  isProvider,
  providerProfileController.acceptBooking
);
router.put(
  "/bookings/:id/reject",
  verifyToken,
  isProvider,
  providerProfileController.rejectBooking
);


router.get(
  "/bookings-total-count",
  verifyToken,
  isProvider,
  providerProfileController.getProviderBookingsCount
);

// Calendar Management
router.get(
  "/calendar/unavailable-dates",
  verifyToken,
  isProvider,
  providerProfileController.getUnavailableDates
);
router.post(
  "/calendar/block-dates",
  verifyToken,
  isProvider,
  providerProfileController.blockDates
);
router.delete(
  "/calendar/unblock-dates",
  verifyToken,
  isProvider,
  providerProfileController.unblockDates
);
router.get(
  "/calendar-bookings",
  verifyToken,
  isProvider,
  providerProfileController.getCalendarBookings
);

// Provider earnings and transactions
router.get(
  "/earnings",
  verifyToken,
  isProvider,
  providerProfileController.getProviderEarnings
);
router.get(
  "/transactions",
  verifyToken,
  isProvider,
  providerProfileController.getProviderTransactions
);

// Provider messages/chat
router.get(
  "/messages",
  verifyToken,
  isProvider,
  providerProfileController.getProviderMessages
);
router.get(
  "/messages/:userId",
  verifyToken,
  isProvider,
  providerProfileController.getMessageThread
);
router.post(
  "/messages/send",
  verifyToken,
  isProvider,
  providerProfileController.sendMessage
);

// Public routes (for user access to provider info)
router.get("/public/:id", providerController.getPublicProviderProfile);
router.get(
  "/public/:id/listings",
  providerController.getPublicProviderListings
);

// Generic routes
router.get("/", providerController.getAllProviders);
router.post("/", providerController.createProvider);
router.get("/:id", providerController.getProviderById);
router.put("/:id", verifyToken, providerController.updateProvider);
router.delete("/:id", providerController.deleteProvider);

module.exports = router;