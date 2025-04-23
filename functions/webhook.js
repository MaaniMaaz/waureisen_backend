
const dotenv = require("dotenv");
const bookingService = require('../services/booking.service');
const Payment = require("../models/payment.model");
dotenv.config();


async function handlePayment(status, payload) {
    try {
      const { amount, userId,listing,checkInDate,checkOutDate  } = payload;

      
      console.log(userId , "user id");
      
      if (status === "success") {
        const newBooking = await bookingService.createBooking({user:userId,totalPrice:amount, listing,checkInDate,checkOutDate});
        await Payment.create({
            userId: userId,
            bookingId:newBooking?._id,
            status: "success",
            amount: amount
           
          });
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  }
  module.exports = { handlePayment };