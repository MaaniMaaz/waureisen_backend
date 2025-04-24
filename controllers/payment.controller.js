const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET);
console.log(process.env.STRIPE_SECRET);

const createPaymentIntent = async (req, res) => {
  try {
    const {
      amount = 100,
      currency,
      listingId,
      checkInDate,
      checkOutDate,
      providerAccountId,
      paymentDelayDays,
    } = req.body;
    const currencySmall = currency?.toLowerCase();
    console.log(req?.user);

    // await stripe.accounts.update(stripeAccountId, {
    //   settings: {
    //     payouts: {
    //       schedule: {
    //         delay_days: paymentDelaydays, // delay 15 days
    //         interval: 'daily', // after delay, pay daily
    //       },
    //     },
    //   },
    // });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currencySmall,
      automatic_payment_methods: {
        enabled: true,
      },
      // transfer_data: {
      //   destination: providerAccountId,
      // },
      metadata: {
        userId: req?.user?.id,
        amount: amount,
        listing: listingId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Payment Intent created successfully",
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
};
