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

exports.applyVoucher = async (req, res, next) => {
  try {
    const { code, bookingId } = req.body;
    
    // Validate voucher
    const voucher = await voucherService.getVoucherByCode(code);
    if (!voucher || voucher.status !== 'active') {
      return res.status(400).json({ message: 'Invalid or expired voucher code' });
    }

    // Get booking
    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate discounted price
    const discountedPrice = booking.totalPrice * (1 - voucher.discountPercentage / 100);

    // Update booking with discounted price
    const updatedBooking = await bookingService.updateBooking(bookingId, {
      totalPrice: discountedPrice,
      appliedVoucher: voucher._id
    });

    res.json({
      message: 'Voucher applied successfully',
      booking: updatedBooking
    });
  } catch (err) {
    next(err);
  }
};

exports.getValidVouchers = async (req, res, next) => {
  try {
    const vouchers = await voucherService.getActiveVouchers();
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};
