const express = require('express');
const router = express.Router();
const travelMagazineController = require('../controllers/travelMagazine.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Public routes (no authentication required)
router.get('/public', travelMagazineController.getPublishedTravelMagazines);
router.get('/public/:id', travelMagazineController.getTravelMagazineById);
router.get('/public/category/:category', travelMagazineController.getTravelMagazinesByCategory);

// Admin-only routes (authentication required)
router.get('/', verifyToken, isAdmin, travelMagazineController.getAllTravelMagazines);
router.get('/:id', verifyToken, isAdmin, travelMagazineController.getTravelMagazineById);
router.post('/', verifyToken, isAdmin, travelMagazineController.createTravelMagazine);
router.put('/:id', verifyToken, isAdmin, travelMagazineController.updateTravelMagazine);
router.delete('/:id', verifyToken, isAdmin, travelMagazineController.deleteTravelMagazine);

module.exports = router;