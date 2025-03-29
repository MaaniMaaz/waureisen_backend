const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const listingController = require('../controllers/listing.controller');
const userController = require('../controllers/user.controller');
const providerController = require('../controllers/provider.controller');
const transactionController = require('../controllers/transaction.controller');
const travelMagazineController = require('../controllers/travelMagazine.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');
const emailNotificationController = require('../controllers/emailNotification.controller');
const filterRoutes = require('./filter.routes');
const voucherRoutes = require('./voucher.routes');
const camperController = require('../controllers/camper.controller');

// Protected routes
// TBD verifyToken, isAdmin
router.get('/', verifyToken, isAdmin, adminController.getAllAdmins);
router.get('/:id', verifyToken, isAdmin, adminController.getAdminById);
router.post('/', verifyToken, isAdmin, adminController.createAdmin);
router.put('/:id', verifyToken, isAdmin, adminController.updateAdmin);
router.delete('/:id', verifyToken, isAdmin, adminController.deleteAdmin);

// Auth routes
//  TBD Signup only temporary
router.post('/signup', adminController.signup);
router.post('/login', adminController.login);

// Listing Management Routes
router.get('/view-all-listings', verifyToken, isAdmin, listingController.getAllListings);
router.post('/add-listing', verifyToken, isAdmin, async (req, res, next) => {
    try {
        // Add admin metadata to the listing
        const listingData = {
            ...req.body,
            owner: req.user.id,
            ownerType: 'Admin'
        };
        req.body = listingData;
        return listingController.createListing(req, res, next);
    } catch (err) {
        next(err);
    }
});
router.delete('/delete-listing/:id', verifyToken, isAdmin, listingController.deleteListing);
// TBD - should we crete a seperate route for unclose or like ban user controller function?
router.put('/close-listing/:id', verifyToken, isAdmin, listingController.closeListing);

// Customer Management Routes
router.get('/view-all-customers', verifyToken, isAdmin, userController.getAllUsers);
router.get('/view-customer/:id', verifyToken, isAdmin, userController.getUserById);
router.put('/ban-user/:id', verifyToken, isAdmin, userController.updateUserStatus);

// Provider Management Routes
router.get('/view-all-providers', verifyToken, isAdmin, providerController.getAllProviders);
router.get('/view-provider/:id', verifyToken, isAdmin, providerController.getProviderById);
router.put('/ban-provider/:id', verifyToken, isAdmin, providerController.updateProviderStatus);

// Transaction Management Routes
router.get('/view-all-transactions', verifyToken, isAdmin, transactionController.getAllTransactions);
router.get('/view-transaction/:id', verifyToken, isAdmin, transactionController.getTransactionById);

// Travel Magazine (Blog) Management Routes
router.get('/view-all-blogs', verifyToken, isAdmin, travelMagazineController.getAllTravelMagazines);
router.get('/view-blog/:id', verifyToken, isAdmin, travelMagazineController.getTravelMagazineById);
router.post('/create-blog', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const blogData = {
            ...req.body,
            author: req.user.id
        };
        req.body = blogData;
        return travelMagazineController.createTravelMagazine(req, res, next);
    } catch (err) {
        next(err);
    }
});
router.put('/edit-blog/:id', verifyToken, isAdmin, travelMagazineController.updateTravelMagazine);
router.delete('/delete-blog/:id', verifyToken, isAdmin, travelMagazineController.deleteTravelMagazine);




// Email Notification Management Routes
router.get('/view-email-notifications', verifyToken, isAdmin, emailNotificationController.getAllEmailNotifications);
router.get('/view-email-notification/:id', verifyToken, isAdmin, emailNotificationController.getEmailNotificationById);
router.post('/add-email-notifications', verifyToken, isAdmin, emailNotificationController.createEmailNotification);
router.put('/update-email-notifications/:id', verifyToken, isAdmin, emailNotificationController.updateEmailNotification);
router.delete('/del-email-notifications/:id', verifyToken, isAdmin, emailNotificationController.deleteEmailNotification);


// Filter Management Routes
// TBD - is this better or should we just add middleware to filter.routes.js?
router.get('/view-all-filters', verifyToken, isAdmin, (req, res, next) => {
    req.url = '/';
    filterRoutes.handle(req, res, next);
});

router.get('/view-filter/:id', verifyToken, isAdmin, (req, res, next) => {
    req.url = `/${req.params.id}`;
    filterRoutes.handle(req, res, next);
});

router.post('/add-filter', verifyToken, isAdmin, (req, res, next) => {
    req.url = '/';
    filterRoutes.handle(req, res, next);
});

router.put('/update-filter/:id', verifyToken, isAdmin, (req, res, next) => {
    req.url = `/${req.params.id}`;
    filterRoutes.handle(req, res, next);
});

router.delete('/del-filter/:id', verifyToken, isAdmin, (req, res, next) => {
    req.url = `/${req.params.id}`;
    filterRoutes.handle(req, res, next);
});



// Voucher Management Routes
router.get('/view-all-vouchers', verifyToken, isAdmin, (req, res, next) => {
    req.url = '/';
    voucherRoutes.handle(req, res, next);
});

router.get('/view-voucher/:id', verifyToken, isAdmin, (req, res, next) => {
    req.url = `/${req.params.id}`;
    voucherRoutes.handle(req, res, next);
});

router.post('/add-voucher', verifyToken, isAdmin, (req, res, next) => {
    req.url = '/';
    voucherRoutes.handle(req, res, next);
});

router.put('/update-voucher/:id', verifyToken, isAdmin, (req, res, next) => {
    req.url = `/${req.params.id}`;
    voucherRoutes.handle(req, res, next);
});

router.delete('/del-voucher/:id', verifyToken, isAdmin, (req, res, next) => {
    req.url = `/${req.params.id}`;
    voucherRoutes.handle(req, res, next);
});

// Camper Management Routes
router.get('/view-all-campers', verifyToken, isAdmin, camperController.getAllCampers);
router.get('/view-camper/:id', verifyToken, isAdmin, camperController.getCamperById);

// Aligns with both old commented and new model 
router.post('/add-camper', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const camperData = {
            ...req.body,
            owner: req.user.id
        };
        req.body = camperData;
        return camperController.createCamper(req, res, next);
    } catch (err) {
        next(err);
    }
});
router.put('/update-camper/:id', verifyToken, isAdmin, camperController.updateCamper);
router.delete('/del-camper/:id', verifyToken, isAdmin, camperController.deleteCamper);

module.exports = router;
