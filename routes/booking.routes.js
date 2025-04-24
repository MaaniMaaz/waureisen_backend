
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');


router.get('/', bookingController.getAllBookings);

router.get('/my', bookingController.getUserBookings);

router.get('/:id', bookingController.getBookingById);

router.post('/', bookingController.createBooking);

router.put('/:id', bookingController.updateBooking);

router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
