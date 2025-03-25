const camperService = require('../services/camper.service');

exports.getAllCampers = async (req, res, next) => {
  try {
    const campers = await camperService.getAllCampers();
    res.json(campers);
  } catch (err) {
    next(err);
  }
};

exports.getCamperById = async (req, res, next) => {
  try {
    const camper = await camperService.getCamperById(req.params.id);
    if (!camper) {
      return res.status(404).json({ message: 'Camper not found' });
    }
    res.json(camper);
  } catch (err) {
    next(err);
  }
};

exports.createCamper = async (req, res, next) => {
  try {
    const newCamper = await camperService.createCamper(req.body);
    res.status(201).json(newCamper);
  } catch (err) {
    next(err);
  }
};

exports.updateCamper = async (req, res, next) => {
  try {
    const updatedCamper = await camperService.updateCamper(req.params.id, req.body);
    if (!updatedCamper) {
      return res.status(404).json({ message: 'Camper not found' });
    }
    res.json(updatedCamper);
  } catch (err) {
    next(err);
  }
};

exports.deleteCamper = async (req, res, next) => {
  try {
    await camperService.deleteCamper(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};