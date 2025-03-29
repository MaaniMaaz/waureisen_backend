const EmailNotification = require('../models/emailNotification.model');

exports.getAllEmailNotifications = async () => {
  return await EmailNotification.find().populate('createdBy');
};

exports.getEmailNotificationById = async (id) => {
  return await EmailNotification.findById(id).populate('createdBy');
};

exports.createEmailNotification = async (data) => {
  const newEmailNotification = new EmailNotification(data);
  return await newEmailNotification.save();
};

exports.updateEmailNotification = async (id, data) => {
  return await EmailNotification.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteEmailNotification = async (id) => {
  await EmailNotification.findByIdAndDelete(id);
};