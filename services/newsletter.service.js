const Newsletter = require('../models/newsletter.model');
const User = require('../models/user.model');

exports.getAllNewsletters = async () => {
  return await Newsletter.find().populate('subscribers', 'email username');
};

exports.getNewsletterById = async (id) => {
  return await Newsletter.findById(id).populate('subscribers', 'email username');
};

exports.createNewsletter = async (data) => {
  const newsletter = new Newsletter(data);
  return await newsletter.save();
};

exports.updateNewsletter = async (id, data) => {
  return await Newsletter.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteNewsletter = async (id) => {
  await Newsletter.findByIdAndDelete(id);
};

exports.addSubscriber = async (newsletterId, userId) => {
  return await Newsletter.findByIdAndUpdate(
    newsletterId,
    { $addToSet: { subscribers: userId } },
    { new: true }
  );
};

exports.removeSubscriber = async (newsletterId, userId) => {
  return await Newsletter.findByIdAndUpdate(
    newsletterId,
    { $pull: { subscribers: userId } },
    { new: true }
  );
};