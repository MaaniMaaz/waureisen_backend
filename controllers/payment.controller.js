const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const Booking = require("../models/booking.model")
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
      providerAccountId = "acct_1RHQnw2MRQIK1rqe",
      paymentDelayDays,
    } = req.body;

    const currencySmall = currency?.toLowerCase();
    

    // Step 1: Calculate fees (Assume 2.9% for Stripe + 10% for platform)
    const stripeFeePercentage = 2.9;
    const platformFeePercentage = 10;

    const stripeFeeAmount = amount * (stripeFeePercentage / 100);
    const platformFeeAmount = amount * (platformFeePercentage / 100);
    const providerAmount = amount - (stripeFeeAmount + platformFeeAmount);

    // Step 2: Configure payout delay for the provider account (Stripe Connect)
    // const accountDelay = await stripe.accounts.update(providerAccountId, {
    //   settings: {
    //     payouts: {
    //       schedule: {
    //         delay_days: paymentDelayDays, // delay payouts by 'paymentDelayDays'
    //         interval: 'daily', // after delay, payout daily
    //       },
    //     },
    //   },
    // });

    // console.log(accountDelay, "Account payout delay set.");

    // Step 3: Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents (Stripe accepts amounts in cents)
      currency: currencySmall,
      automatic_payment_methods: {
        enabled: true,
      },
      // transfer_data: {
      //   destination: providerAccountId, // Direct transfer to provider's account
      // },
      metadata: {
        userId: req?.user?.id,
        amount: amount,
        listing: listingId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        platformFeeAmount,
        providerAmount,
        stripeFeeAmount,
      },
    });

    

    // Step 4: Return Payment Intent details in the response
    return res.status(200).json({
      success: true,
      data: {
        message: "Payment Intent created successfully",
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        platformFeeAmount,
        providerAmount,
        stripeFeeAmount,
      },
    });
  } catch (error) {
    // Step 5: Error Handling
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const transferPayment = async (req, res) => {
  try {
    console.log("transfer yahan tak aaya");
    
    const { connectedAccountId , amount,currency,bookingId } = req?.body;


    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: currency,
      destination: connectedAccountId,
    
    });
    
    if(transfer?.id){
     await Booking.findByIdAndUpdate(bookingId,{status:"confirmed"})
    }
    
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const refundPayment = () => {
//   try {
//     const {noOfDays,bookingId} = req?.body

//     // const booking

//   }catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

module.exports = {
  createPaymentIntent,
  transferPayment
};
