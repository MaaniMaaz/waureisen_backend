const languageService = require('../services/language.service');

exports.getAllLanguages = async (req, res, next) => {
  try {
    const languages = await languageService.getAllLanguages();
    res.json(languages);
  } catch (err) {
    next(err);
  }
};

exports.getLanguageById = async (req, res, next) => {
  try {
    const language = await languageService.getLanguageById(req.params.id);
    res.json(language);
  } catch (err) {
    next(err);
  }
};

exports.createLanguage = async (req, res, next) => {
  try {
    const newLanguage = await languageService.createLanguage(req.body);
    res.status(201).json(newLanguage);
  } catch (err) {
    next(err);
  }
};

exports.updateLanguage = async (req, res, next) => {
  try {
    const updatedLanguage = await languageService.updateLanguage(req.params.id, req.body);
    res.json(updatedLanguage);
  } catch (err) {
    next(err);
  }
};

exports.deleteLanguage = async (req, res, next) => {
  try {
    await languageService.deleteLanguage(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
