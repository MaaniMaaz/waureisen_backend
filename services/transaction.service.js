const Transaction = require('../models/transaction.model');

exports.getAllTransactions = async () => {
  return await Transaction.find().populate('user');
};

exports.getTransactionById = async (id) => {
  return await Transaction.findById(id).populate('user');
};

exports.createTransaction = async (data) => {
  const newTransaction = new Transaction(data);
  return await newTransaction.save();
};

exports.updateTransaction = async (id, data) => {
  return await Transaction.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteTransaction = async (id) => {
  await Transaction.findByIdAndDelete(id);
};
