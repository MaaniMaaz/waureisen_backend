const Voucher = require('../models/voucher.model');

exports.getAllVouchers = async () => {
  return await Voucher.find();
};

exports.getVoucherById = async (id) => {
  return await Voucher.findById(id);
};

exports.createVoucher = async (data) => {
  const newVoucher = new Voucher(data);
  return await newVoucher.save();
};

exports.updateVoucher = async (id, data) => {
  return await Voucher.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteVoucher = async (id) => {
  await Voucher.findByIdAndDelete(id);
};
