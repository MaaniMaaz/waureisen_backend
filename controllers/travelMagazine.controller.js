const travelMagazineService = require('../services/travelMagazine.service');

// Controller methods
exports.getAllTravelMagazines = async (req, res, next) => {
  try {
    const travelMagazines = await travelMagazineService.getAllTravelMagazines();
    res.json(travelMagazines);
  } catch (err) {
    next(err);
  }
};

exports.getTravelMagazineById = async (req, res, next) => {
  try {
    const travelMagazine = await travelMagazineService.getTravelMagazineById(req.params.id);
    res.json(travelMagazine);
  } catch (err) {
    next(err);
  }
};

exports.createTravelMagazine = async (req, res, next) => {
  try {
    const newTravelMagazine = await travelMagazineService.createTravelMagazine(req.body);
    res.status(201).json(newTravelMagazine);
  } catch (err) {
    next(err);
  }
};

exports.updateTravelMagazine = async (req, res, next) => {
  try {
    const updatedTravelMagazine = await travelMagazineService.updateTravelMagazine(req.params.id, req.body);
    res.json(updatedTravelMagazine);
  } catch (err) {
    next(err);
  }
};

exports.deleteTravelMagazine = async (req, res, next) => {
  try {
    await travelMagazineService.deleteTravelMagazine(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
