const filterService = require('../services/filter.service');

exports.getAllFilters = async (req, res, next) => {
  try {
    const filters = await filterService.getAllFilters();
    res.json(filters);
  } catch (err) {
    next(err);
  }
};

exports.getFilterById = async (req, res, next) => {
  try {
    const filter = await filterService.getFilterById(req.params.id);
    res.json(filter);
  } catch (err) {
    next(err);
  }
};

exports.createFilter = async (req, res, next) => {
  try {
    const newFilter = await filterService.createFilter(req.body);
    res.status(201).json(newFilter);
  } catch (err) {
    next(err);
  }
};

exports.updateFilter = async (req, res, next) => {
  try {
    const updatedFilter = await filterService.updateFilter(req.params.id, req.body);
    res.json(updatedFilter);
  } catch (err) {
    next(err);
  }
};

exports.deleteFilter = async (req, res, next) => {
  try {
    await filterService.deleteFilter(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
