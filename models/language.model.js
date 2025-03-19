const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  languageCode: { type: String, required: true, unique: true },
  translations: { type: Map, of: String },
  updatedAt: { type: Date, default: Date.now }
});

const Language = mongoose.model('Language', languageSchema);
module.exports = Language;
