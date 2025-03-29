const Message = require('../models/message.model');

exports.getAllMessages = async () => {
  return await Message.find()
    .populate('user')
    .populate({
      path: 'listing',
      populate: {
        path: 'owner'
      }
    });
};

exports.getMessageById = async (id) => {
  return await Message.findById(id)
    .populate('user')
    .populate({
      path: 'listing',
      populate: {
        path: 'owner'
      }
    });
};

exports.getMessagesByUser = async (userId) => {
  return await Message.find({ user: userId })
    .populate({
      path: 'listing',
      populate: {
        path: 'owner'
      }
    });
};

exports.getMessagesByListing = async (listingId) => {
  return await Message.find({ listing: listingId })
    .populate('user')
    .populate({
      path: 'listing',
      populate: {
        path: 'owner'
      }
    });
};

exports.createMessage = async (data) => {
  const newMessage = new Message(data);
  return await newMessage.save();
};

exports.updateMessage = async (id, data) => {
  return await Message.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteMessage = async (id) => {
  await Message.findByIdAndDelete(id);
};

exports.markAsRead = async (id) => {
  return await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
};