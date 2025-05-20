const express = require('express');
const router = express.Router();
const travelMagazineController = require('../controllers/travelMagazine.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Public routes (no authentication required)
router.get('/public', travelMagazineController.getPublishedTravelMagazines);
// FIXED: More specific route with fixed segments should come BEFORE routes with parameters
router.get('/public/category/:category', travelMagazineController.getTravelMagazinesByCategory);
// This route should come AFTER more specific routes
router.get('/public/:title', travelMagazineController.getTravelMagazineByTitle);

// Admin-only routes (authentication required)
router.get('/', verifyToken, isAdmin, travelMagazineController.getAllTravelMagazines);
router.get('/:id', verifyToken, isAdmin, travelMagazineController.getTravelMagazineById);
router.post('/', verifyToken, isAdmin, travelMagazineController.createTravelMagazine);
router.put('/:id', verifyToken, isAdmin, travelMagazineController.updateTravelMagazine);
router.delete('/:id', verifyToken, isAdmin, travelMagazineController.deleteTravelMagazine);

module.exports = router;