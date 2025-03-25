const express = require('express');
const router = express.Router();
const emailNotificationController = require('../controllers/emailNotification.controller');
const { verifyToken } = require('../middlewares/auth');

// Get all email notifications
router.get('/', emailNotificationController.getAllEmailNotifications);

// Get specific email notification
router.get('/:id', emailNotificationController.getEmailNotificationById);

// Create new email notification
router.post('/', emailNotificationController.createEmailNotification);

// Update email notification
router.put('/:id', emailNotificationController.updateEmailNotification);

// Delete email notification
router.delete('/:id', emailNotificationController.deleteEmailNotification);

// Get active notifications (public route)
router.get('/active', async (req, res, next) => {
    try {
        const notifications = await emailNotificationController.getAllEmailNotifications();
        const activeNotifications = notifications.filter(notification => notification.isActive);
        res.json(activeNotifications);
    } catch (err) {
        next(err);
    }
});

module.exports = router;