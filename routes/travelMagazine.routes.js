const express = require('express');
const router = express.Router();
const travelMagazineController = require('../controllers/travelMagazine.controller');

router.get('/', travelMagazineController.getAllTravelMagazines);

router.get('/:id', travelMagazineController.getTravelMagazineById);

router.post('/', travelMagazineController.createTravelMagazine);

router.put('/:id', travelMagazineController.updateTravelMagazine);

router.delete('/:id', travelMagazineController.deleteTravelMagazine);

module.exports = router;
