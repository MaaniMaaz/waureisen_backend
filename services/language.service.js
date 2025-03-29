const Language = require('../models/language.model');

exports.getAllLanguages = async () => {
  return await Language.find();
};

exports.getLanguageById = async (id) => {
  return await Language.findById(id);
};

exports.createLanguage = async (data) => {
  const newLanguage = new Language(data);
  return await newLanguage.save();
};

exports.updateLanguage = async (id, data) => {
  return await Language.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteLanguage = async (id) => {
  await Language.findByIdAndDelete(id);
};
