const dotenv = require("dotenv");
const bookingService = require("../services/booking.service");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");

dotenv.config();

async function handlePayment(status, payload, eventData) {
  try {
    const { amount, userId, listing, checkInDate, checkOutDate,providerAccountId } = payload;

    console.log(userId, "user id", eventData);

    if (status === "success") {
      const newBooking = await bookingService.createBooking({
        user: userId,
        totalPrice: amount,
        listing,
        checkInDate,
        checkOutDate,
        paymentIntentId: eventData?.id,
        providerAccountId:providerAccountId
      });
      await Payment.create({
        userId: userId,
        bookingId: newBooking?._id,
        status: "success",
        amount: amount,
      });

      await User.findByIdAndUpdate(userId , {latestChargeId:eventData?.latest_charge})
    }
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

// async function handleTransfer()
module.exports = { handlePayment };
