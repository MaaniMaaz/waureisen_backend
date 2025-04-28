const bookingService = require('../services/booking.service');
const voucherService = require('../services/voucher.service');
const bookingNotificationService = require('../services/bookingNotification.service');

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const newBooking = await bookingService.createBooking(req.body);
    
    // Send booking notification email to the provider
    try {
      await bookingNotificationService.sendBookingNotificationEmail(newBooking);
    } catch (emailError) {
      console.error('Error sending booking notification email:', emailError);
      // Continue with the booking process even if email fails
    }
    
    res.status(201).json(newBooking);
  } catch (err) {
    next(err);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const updatedBooking = await bookingService.updateBooking(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    await bookingService.deleteBooking(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    console.log(req?.user)
    const bookings = await bookingService.getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);

    console.log(booking);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    const updatedBooking = await bookingService.updateBooking(req.params.id, { status: 'canceled' });
    res.json(updatedBooking);
  } catch (err) {
    next(err);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const appointmentData = {
      ...req.body,
      user: req.user.id,
      type: 'appointment'
    };
    const newAppointment = await bookingService.createBooking(appointmentData);
    res.status(201).json(newAppointment);
  } catch (err) {
    next(err);
  }
};

exports.getUserAppointments = async (req, res, next) => {
  try {
    const appointments = await bookingService.getAppointmentsByUser(req.user.id);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await bookingService.getBookingById(req.params.id);
    
    if (!appointment || appointment.type !== 'appointment') {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    const updatedAppointment = await bookingService.updateBooking(req.params.id, { status: 'canceled' });
    res.json(updatedAppointment);
  } catch (err) {
    next(err);
  }
};