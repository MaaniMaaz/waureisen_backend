const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const moment = require("moment");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const createPaymentIntent = async (req, res) => {
  try {
    const {
      amount = 100,
      currency,
      listingId,
      checkInDate,
      checkOutDate,
      providerAccountId,
    } = req.body;

    const currencySmall = currency?.toLowerCase();

  

    const userData = await User?.findById(req?.user?.id);


    // Step 1: Calculate fees (Assume 2.9% for Stripe + 10% for platform)
    const stripeFeePercentage = 2.9;
    const platformFeePercentage = 10;

    const stripeFeeAmount = amount * (stripeFeePercentage / 100);
    const platformFeeAmount = amount * (platformFeePercentage / 100);
    const providerAmount = amount - (stripeFeeAmount + platformFeeAmount);



    // Step 3: Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: currencySmall,
      automatic_payment_methods: {
        enabled: true,
      },
     
      metadata: {
        name: userData?.username,
        email: userData?.email,
        userId: req?.user?.id,
        amount: amount,
        listing: listingId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        platformFeeAmount,
        providerAmount,
        stripeFeeAmount,
        providerAccountId,
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

    

    const { connectedAccountId, amount, currency, bookingId } = req?.body;
    const stripeFee = amount * 0.029;
    const platformFee = (amount - stripeFee) * 0.10;



    const transfer = await stripe.transfers.create({
      amount: Math.round(amount - stripeFee - platformFee) * 100,
      currency: currency,
      destination: connectedAccountId,
    });

    const transfer2 = await stripe.transfers.create({
      amount: Math.round(platformFee) * 100,
      currency: currency,
      destination: "acct_1RHQnw2MRQIK1rqe",
    });

    console.log(transfer ,"transfer 1", transfer2 , "transfer 2")
    if (transfer?.id && transfer2?.id) {
      await Booking.findByIdAndUpdate(bookingId, { status: "confirmed" });

    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const refundPayment = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  let amount;
  const totalAmmount = booking?.totalPrice * 100;
  const targetDate = moment(booking?.checkInDate).startOf("day");
  const now = moment().startOf("day");
  const daysLeft = targetDate.diff(now, "days");

  if (daysLeft > 10) {
    amount = totalAmmount;
  } else if (daysLeft < 10 && daysLeft > 5) {
    amount = totalAmmount * 0.5;
  } else if (daysLeft < 5 && daysLeft > 1) {
    amount = totalAmmount * 0.25;
  } else {
    amount = totalAmmount * 0.1;
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: booking?.paymentIntentId,
      amount: Math.round(amount),
      // ...(amount && { amount }),
    });

    booking.status = "canceled"
    booking.save()

    res.status(200).json({ success: true, refund });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCardDetails = async (req, res) => {
  try {
    const user = await User?.findById(req?.user?.id);
    console.log(user);

    const charge = await stripe.charges.retrieve(user?.latestChargeId);
    const card = charge.payment_method_details.card;

    res.status(200).json({ success: true, card });
  } catch (error) {
    console.error("Card error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createStripeAccount = async (req, res) => {
  try {
    // 1. Create a Stripe Connect account (if not already created)
    const account = await stripe.accounts.create({
      type: 'express',
      email: req.body.email, // you should pass the user email from frontend
    });
console.log(account , "account ka data " , account?.details_submitted)
    // 2. Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
  refresh_url: `http://localhost:5173/provider/registration?account=failed`, 
  return_url: `http://localhost:5173/provider/registration?account=${account.id}`, 
  type: 'account_onboarding',
    });

    // 3. Optionally: Save the account ID in your DB for future use
    // await User.findByIdAndUpdate(req.user.id, { stripeAccountId: account.id });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe Connect onboarding link:", error);
    res.status(500).json({ error: error.message });
  }
};

const getStripeAccount = async (req,res) => {
  try{
    const {accountId} = req?.params
    const account = await stripe.accounts.retrieve(accountId);
    res.json({ data: account });
  }catch(err){
    console.error("Error creating Stripe Connect onboarding link:", error);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createPaymentIntent,
  transferPayment,
  refundPayment,
  getCardDetails,
  createStripeAccount,
  getStripeAccount
};
