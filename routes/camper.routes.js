const express = require('express');
const router = express.Router();
const camperController = require('../controllers/camper.controller');
const { verifyToken } = require('../middlewares/auth');
const { isProvider } = require('../middlewares/role');

router.get('/', camperController.getAllCampers);

router.get('/:id', camperController.getCamperById);

router.post('/', verifyToken, isProvider, camperController.createCamper);

router.put('/:id', verifyToken, isProvider, camperController.updateCamper);

router.delete('/:id', verifyToken, isProvider, camperController.deleteCamper);

module.exports = router;