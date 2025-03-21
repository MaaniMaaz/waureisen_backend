const voucherService = require('../services/voucher.service');

exports.getAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await voucherService.getAllVouchers();
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};

exports.getVoucherById = async (req, res, next) => {
  try {
    const voucher = await voucherService.getVoucherById(req.params.id);
    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

exports.createVoucher = async (req, res, next) => {
  try {
    const newVoucher = await voucherService.createVoucher(req.body);
    res.status(201).json(newVoucher);
  } catch (err) {
    next(err);
  }
};

exports.updateVoucher = async (req, res, next) => {
  try {
    const updatedVoucher = await voucherService.updateVoucher(req.params.id, req.body);
    res.json(updatedVoucher);
  } catch (err) {
    next(err);
  }
};

exports.deleteVoucher = async (req, res, next) => {
  try {
    await voucherService.deleteVoucher(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
