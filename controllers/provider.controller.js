const providerService = require('../services/provider.service');

exports.getAllProviders = async (req, res, next) => {
  try {
    const providers = await providerService.getAllProviders();
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderById(req.params.id);
    res.json(provider);
  } catch (err) {
    next(err);
  }
};

exports.createProvider = async (req, res, next) => {
  try {
    const newProvider = await providerService.createProvider(req.body);
    res.status(201).json(newProvider);
  } catch (err) {
    next(err);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const updatedProvider = await providerService.updateProvider(req.params.id, req.body);
    res.json(updatedProvider);
  } catch (err) {
    next(err);
  }
};

exports.deleteProvider = async (req, res, next) => {
  try {
    await providerService.deleteProvider(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
