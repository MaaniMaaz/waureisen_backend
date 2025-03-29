const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth'); 
const { isProvider } = require('../middlewares/role');

const providerController = require('../controllers/provider.controller');

// Auth routes
router.post('/signup', providerController.signup);
router.post('/login', providerController.login);

router.get('/', providerController.getAllProviders);

router.get('/:id', providerController.getProviderById);

router.post('/', providerController.createProvider);

router.put('/:id', verifyToken, providerController.updateProvider);

router.delete('/:id', providerController.deleteProvider);

// Provider adds a new listing
router.post('/add-listing', verifyToken, isProvider, providerController.addListing);

module.exports = router;
