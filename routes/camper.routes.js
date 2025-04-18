const express = require('express');
const router = express.Router();
const camperController = require('../controllers/camper.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Public routes (no authentication required)
router.get('/public', camperController.getAvailableCampers);
router.get('/public/:id', camperController.getCamperById);
router.get('/public/category/:category', camperController.getCampersByCategory);

// Admin-only routes (authentication required)
router.get('/', verifyToken, isAdmin, camperController.getAllCampers);
router.get('/:id', verifyToken, isAdmin, camperController.getCamperById);
router.post('/', verifyToken, isAdmin, camperController.createCamper);
router.put('/:id', verifyToken, isAdmin, camperController.updateCamper);
router.delete('/:id', verifyToken, isAdmin, camperController.deleteCamper);

module.exports = router;