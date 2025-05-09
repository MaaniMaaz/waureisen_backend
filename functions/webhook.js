const dotenv = require("dotenv");
const bookingService = require("../services/booking.service");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");

dotenv.config();

async function handlePayment(status, payload, eventData) {
  try {
    const { amount, userId, listing,providerId,currency, checkInDate, checkOutDate,providerAccountId } = payload;

    console.log(userId, "user id", eventData);

    if (status === "success") {
      const newBooking = await bookingService.createBooking({
        user: userId,
        totalPrice: amount,
        listing,
        provider:providerId,
        checkInDate,
        checkOutDate,
        currency,
        paymentIntentId: eventData?. payment_intent,
        providerAccountId:providerAccountId,
        reciept:eventData?.receipt_url
      });
      await Payment.create({
        userId: userId,
        bookingId: newBooking?._id,
        status: "success",
        amount: amount,
      });

      await User.findByIdAndUpdate(userId , {latestChargeId:eventData?.id})
    }
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

// async function handleTransfer()
module.exports = { handlePayment };
