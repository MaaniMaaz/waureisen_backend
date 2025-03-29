const newsletterService = require('../services/newsletter.service');

exports.getAllNewsletters = async (req, res, next) => {
  try {
    const newsletters = await newsletterService.getAllNewsletters();
    res.json(newsletters);
  } catch (err) {
    next(err);
  }
};

exports.getNewsletterById = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.getNewsletterById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }
    res.json(newsletter);
  } catch (err) {
    next(err);
  }
};

exports.createNewsletter = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.createNewsletter(req.body);
    res.status(201).json(newsletter);
  } catch (err) {
    next(err);
  }
};

exports.updateNewsletter = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.updateNewsletter(req.params.id, req.body);
    res.json(newsletter);
  } catch (err) {
    next(err);
  }
};

exports.deleteNewsletter = async (req, res, next) => {
  try {
    await newsletterService.deleteNewsletter(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};