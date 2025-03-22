const messageService = require('../services/message.service');
const listingService = require('../services/listing.service');

exports.getAllMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getAllMessages();
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.getMessageById = async (req, res, next) => {
  try {
    const message = await messageService.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
};

exports.getMessagesByUser = async (req, res, next) => {
  try {
    const messages = await messageService.getMessagesByUser(req.user.id);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.getMessagesByListing = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the listing owner
    if (listing.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await messageService.getMessagesByListing(req.params.listingId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.body.listing);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const messageData = {
      ...req.body,
      user: req.user.id
    };

    const newMessage = await messageService.createMessage(messageData);
    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const message = await messageService.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow user who created the message to update it
    if (message.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this message' });
    }

    const updatedMessage = await messageService.updateMessage(req.params.id, req.body);
    res.json(updatedMessage);
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await messageService.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow user who created the message to delete it
    if (message.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await messageService.deleteMessage(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const message = await messageService.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const listing = await listingService.getListingById(message.listing);
    // Only allow listing owner to mark messages as read
    if (listing.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    const updatedMessage = await messageService.markAsRead(req.params.id);
    res.json(updatedMessage);
  } catch (err) {
    next(err);
  }
};