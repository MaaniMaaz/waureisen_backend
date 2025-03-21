const express = require('express');
const router = express.Router();
const providerController = require('../controllers/provider.controller');


router.get('/', providerController.getAllProviders);

router.get('/:id', providerController.getProviderById);

router.post('/', providerController.createProvider);

router.put('/:id', providerController.updateProvider);

router.delete('/:id', providerController.deleteProvider);

module.exports = router;
