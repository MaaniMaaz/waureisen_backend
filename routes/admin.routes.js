const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const listingController = require("../controllers/listing.controller");
const userController = require("../controllers/user.controller");
const providerController = require("../controllers/provider.controller");
const transactionController = require("../controllers/transaction.controller");
const travelMagazineController = require("../controllers/travelMagazine.controller");
// Add these routes to your existing admin routes file

// Import required middleware
const { verifyToken } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");

const emailNotificationController = require("../controllers/emailNotification.controller");
const filterRoutes = require("./filter.routes");
const voucherRoutes = require("./voucher.routes");
const camperController = require("../controllers/camper.controller");

// =====================================================
// AUTH ROUTES (no authentication required)
// =====================================================
router.post("/signup", adminController.signup);
router.post("/login", adminController.login);

// =====================================================
// NON-PARAMETERIZED ROUTES (must come before /:id routes)
// =====================================================

// Recommendation routes
router.get("/recommendations", verifyToken, adminController.getRecommendations); // Allow all authenticated users to access
router.put(
  "/recommendations/top",
  verifyToken,
  isAdmin,
  adminController.updateTopRecommendations
);
router.put(
  "/recommendations/popular",
  verifyToken,
  isAdmin,
  adminController.updatePopularAccommodations
);
router.put(
  "/recommendations/exclusive",
  verifyToken,
  isAdmin,
  adminController.updateExclusiveFinds
);

// Listing Management Routes
router.get(
  "/view-all-listings",
  verifyToken,
  isAdmin,
  listingController.getAllListings
);
router.post("/add-listing", verifyToken, isAdmin, async (req, res, next) => {
  try {
    // Add admin metadata to the listing
    const listingData = {
      ...req.body,
      owner: req.user.id,
      ownerType: "Admin",
    };
    req.body = listingData;
    return listingController.createListing(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Customer Management Routes
router.get(
  "/view-all-customers",
  verifyToken,
  isAdmin,
  userController.getAllUsers
);

// Provider Management Routes
router.get(
  "/view-all-providers",
  verifyToken,
  isAdmin,
  providerController.getAllProviders
);

// Transaction Management Routes
router.get(
  "/view-all-transactions",
  verifyToken,
  isAdmin,
  transactionController.getAllTransactions
);

// Travel Magazine (Blog) Management Routes
router.get(
  "/view-all-blogs",
  verifyToken,
  isAdmin,
  travelMagazineController.getAllTravelMagazines
);
router.post("/create-blog", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user.id,
    };
    req.body = blogData;
    return travelMagazineController.createTravelMagazine(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Email Notification Management Routes
router.get(
  "/view-email-notifications",
  verifyToken,
  isAdmin,
  emailNotificationController.getAllEmailNotifications
);
router.post(
  "/add-email-notifications",
  verifyToken,
  isAdmin,
  emailNotificationController.createEmailNotification
);

// Filter Management Routes
router.get("/view-all-filters", verifyToken, isAdmin, (req, res, next) => {
  req.url = "/";
  filterRoutes.handle(req, res, next);
});
router.post("/add-filter", verifyToken, isAdmin, (req, res, next) => {
  req.url = "/";
  filterRoutes.handle(req, res, next);
});

// Voucher Management Routes
router.get("/view-all-vouchers", verifyToken, isAdmin, (req, res, next) => {
  req.url = "/";
  voucherRoutes.handle(req, res, next);
});
router.post("/add-voucher", verifyToken, isAdmin, (req, res, next) => {
  req.url = "/";
  voucherRoutes.handle(req, res, next);
});

// Camper Management Routes
router.get(
  "/view-all-campers",
  verifyToken,
  isAdmin,
  camperController.getAllCampers
);
router.post("/add-camper", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const camperData = {
      ...req.body,
      owner: req.user.id,
    };
    req.body = camperData;
    return camperController.createCamper(req, res, next);
  } catch (err) {
    next(err);
  }
});

// =====================================================
// ADMIN CRUD ROUTES
// =====================================================
router.get("/", verifyToken, isAdmin, adminController.getAllAdmins);
router.post("/", verifyToken, isAdmin, adminController.createAdmin);

// =====================================================
// PARAMETERIZED ROUTES (must come after non-parameterized routes)
// =====================================================

// Admin CRUD with params
router.get("/:id", verifyToken, isAdmin, adminController.getAdminById);
router.put("/:id", verifyToken, isAdmin, adminController.updateAdmin);
router.delete("/:id", verifyToken, isAdmin, adminController.deleteAdmin);

// Listing Management Routes with params
router.delete(
  "/delete-listing/:id",
  verifyToken,
  isAdmin,
  listingController.deleteListing
);
router.put(
  "/close-listing/:id",
  verifyToken,
  isAdmin,
  listingController.closeListing
);

// Customer Management Routes with params
router.get(
  "/view-customer/:id",
  verifyToken,
  isAdmin,
  userController.getUserById
);
router.put(
  "/ban-user/:id",
  verifyToken,
  isAdmin,
  userController.updateUserStatus
);

// Provider Management Routes with params
router.get(
  "/view-provider/:id",
  verifyToken,
  isAdmin,
  providerController.getProviderById
);
router.put(
  "/ban-provider/:id",
  verifyToken,
  isAdmin,
  providerController.updateProviderStatus
);

// Transaction Management Routes with params
router.get(
  "/view-transaction/:id",
  verifyToken,
  isAdmin,
  transactionController.getTransactionById
);

// Travel Magazine (Blog) Management Routes with params
router.get(
  "/view-blog/:id",
  verifyToken,
  isAdmin,
  travelMagazineController.getTravelMagazineById
);
router.put(
  "/edit-blog/:id",
  verifyToken,
  isAdmin,
  travelMagazineController.updateTravelMagazine
);
router.delete(
  "/delete-blog/:id",
  verifyToken,
  isAdmin,
  travelMagazineController.deleteTravelMagazine
);

// Email Notification Management Routes with params
router.get(
  "/view-email-notification/:id",
  verifyToken,
  isAdmin,
  emailNotificationController.getEmailNotificationById
);
router.put(
  "/update-email-notifications/:id",
  verifyToken,
  isAdmin,
  emailNotificationController.updateEmailNotification
);
router.delete(
  "/del-email-notifications/:id",
  verifyToken,
  isAdmin,
  emailNotificationController.deleteEmailNotification
);

// Filter Management Routes with params
router.get("/view-filter/:id", verifyToken, isAdmin, (req, res, next) => {
  req.url = `/${req.params.id}`;
  filterRoutes.handle(req, res, next);
});
router.put("/update-filter/:id", verifyToken, isAdmin, (req, res, next) => {
  req.url = `/${req.params.id}`;
  filterRoutes.handle(req, res, next);
});
router.delete("/del-filter/:id", verifyToken, isAdmin, (req, res, next) => {
  req.url = `/${req.params.id}`;
  filterRoutes.handle(req, res, next);
});

// Voucher Management Routes with params
router.get("/view-voucher/:id", verifyToken, isAdmin, (req, res, next) => {
  req.url = `/${req.params.id}`;
  voucherRoutes.handle(req, res, next);
});
router.put("/update-voucher/:id", verifyToken, isAdmin, (req, res, next) => {
  req.url = `/${req.params.id}`;
  voucherRoutes.handle(req, res, next);
});
router.delete("/del-voucher/:id", verifyToken, isAdmin, (req, res, next) => {
  req.url = `/${req.params.id}`;
  voucherRoutes.handle(req, res, next);
});

// Camper Management Routes with params
router.get(
  "/view-camper/:id",
  verifyToken,
  isAdmin,
  camperController.getCamperById
);
router.put(
  "/update-camper/:id",
  verifyToken,
  isAdmin,
  camperController.updateCamper
);
router.delete(
  "/del-camper/:id",
  verifyToken,
  isAdmin,
  camperController.deleteCamper
);

module.exports = router;
