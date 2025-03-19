const mongoose = require('mongoose');

const filterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const Filter = mongoose.model('Filter', filterSchema);
module.exports = Filter;
