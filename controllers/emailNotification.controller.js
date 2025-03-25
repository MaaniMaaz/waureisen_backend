const emailNotificationService = require('../services/emailNotification.service');

exports.getAllEmailNotifications = async (req, res, next) => {
  try {
    const notifications = await emailNotificationService.getAllEmailNotifications();
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.getEmailNotificationById = async (req, res, next) => {
  try {
    const notification = await emailNotificationService.getEmailNotificationById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Email notification template not found' });
    }
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

exports.createEmailNotification = async (req, res, next) => {
  try {
    const notificationData = {
      ...req.body,
      createdBy: req.user.id
    };
    const newNotification = await emailNotificationService.createEmailNotification(notificationData);
    res.status(201).json(newNotification);
  } catch (err) {
    next(err);
  }
};

exports.updateEmailNotification = async (req, res, next) => {
  try {
    const updatedNotification = await emailNotificationService.updateEmailNotification(
      req.params.id,
      { ...req.body, updatedAt: Date.now() }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: 'Email notification template not found' });
    }
    res.json(updatedNotification);
  } catch (err) {
    next(err);
  }
};

exports.deleteEmailNotification = async (req, res, next) => {
  try {
    await emailNotificationService.deleteEmailNotification(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};