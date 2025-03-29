const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Admin routes
router.get('/', verifyToken, isAdmin, newsletterController.getAllNewsletters);
router.get('/:id', verifyToken, isAdmin, newsletterController.getNewsletterById);
router.post('/', verifyToken, isAdmin, newsletterController.createNewsletter);
router.put('/:id', verifyToken, isAdmin, newsletterController.updateNewsletter);
router.delete('/:id', verifyToken, isAdmin, newsletterController.deleteNewsletter);

module.exports = router;