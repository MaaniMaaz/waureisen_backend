const dotenv = require("dotenv");
const bookingService = require("../services/booking.service");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");

dotenv.config();

async function handlePayment(status, payload, eventData) {
  try {
    const { amount, userId, listing,providerId,currency, checkInDate, checkOutDate,providerAccountId } = payload;

console.log("booking chal rahi hai");
const stripeFee = 0.029 * amount;
const platformFee = 0.10 * amount;
const totalFees = stripeFee + platformFee;
const providerAmount = amount - totalFees;
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
        // maaz bhai fields
          transactionId: eventData?. payment_intent,
      currency: currency,
      method: 'card',
      details: `Booking payment - ${amount} ${currency.toUpperCase()}`,
      date: new Date(),
      // Store additional payment breakdown
     fees: {
  stripeFee: parseFloat(stripeFee.toFixed(2)),
  platformFee: parseFloat(platformFee.toFixed(2)),
  providerAmount: parseFloat(providerAmount.toFixed(2))
}
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
