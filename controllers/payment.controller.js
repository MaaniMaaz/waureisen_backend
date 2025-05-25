const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const moment = require("moment");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Listing = require("../models/listing.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const createPaymentIntent = async (req, res) => {
  try {
    const {
      amount = 100,
      currency,
      listingId,
      providerId,
      checkInDate,
      checkOutDate,
      providerAccountId,
    } = req.body;

    const currencySmall = currency?.toLowerCase();

    const userData = await User?.findById(req?.user?.id);
    console.log(req?.user?.id, userData, "user Data");

    const stripeFeePercentage = 2.9;
    const platformFeePercentage = 10;

    const stripeFeeAmount = amount * (stripeFeePercentage / 100);
    const platformFeeAmount = amount * (platformFeePercentage / 100);
    const providerAmount = amount - (stripeFeeAmount + platformFeeAmount);

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
        providerId: providerId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        currency,
        platformFeeAmount,
        providerAmount,
        stripeFeeAmount,
        providerAccountId,
      },
    });

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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const transferPayment = async (req, res) => {
  try {
    console.log("transfer api called");
    const { connectedAccountId, amount, currency, bookingId } = req?.body;
    const stripeFee = amount * 0.029;
    const platformFee = (amount - stripeFee) * 0.1;

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount - stripeFee - platformFee) * 100,
      currency: currency,
      destination: connectedAccountId,
    });
    console.log("Amount transfer to provider");
    const transfer2 = await stripe.transfers.create({
      amount: Math.round(platformFee) * 100,
      currency: currency,
      destination: "acct_1RHQnw2MRQIK1rqe",
    });
    console.log("Amount transfer to platform");

    console.log(transfer, "transfer 1", transfer2, "transfer 2");
    if (transfer?.id && transfer2?.id) {
      await Booking.findByIdAndUpdate(bookingId, { status: "confirmed" });
    }
    console.log("Booking Confirmed!");
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
  const listing = await Listing.findById(booking?.listing);
  console.log(booking, "booking ka data", listing?.legal?.cancellationPolicy);
  let amount = 0;
  const totalAmmount = booking?.totalPrice * 100;
  const targetDate = moment(booking?.checkInDate).startOf("day");
  const now = moment().startOf("day");
  const daysLeft = targetDate.diff(now, "days");

  if (listing?.legal?.cancellationPolicy === "flexible") {
    if (daysLeft > 1) {
      amount = totalAmmount;
    } else if (daysLeft > 0) {
      amount = totalAmmount * 0.5;
    }
  } else if (listing?.legal?.cancellationPolicy === "moderate") {
    if (daysLeft > 5) {
      amount = totalAmmount;
    } else if (daysLeft > 4) {
      amount = totalAmmount * 0.5;
    } else if (daysLeft > 3) {
      amount = totalAmmount * 0.6;
    } else if (daysLeft > 2) {
      amount = totalAmmount * 0.7;
    } else if (daysLeft > 1) {
      amount = totalAmmount * 0.8;
    } else if (daysLeft > 0) {
      amount = totalAmmount * 0.9;
    } else {
      amount = 0;
    }
  } else if (listing?.legal?.cancellationPolicy === "strict") {
    if (daysLeft > 6) {
      amount = totalAmmount * 0.5;
    } else if (daysLeft > 5) {
      amount = totalAmmount * 0.6;
    } else if (daysLeft > 4) {
      amount = totalAmmount * 0.7;
    } else if (daysLeft > 3) {
      amount = totalAmmount * 0.8;
    } else if (daysLeft > 2) {
      amount = totalAmmount * 0.9;
    } else {
      amount = 0;
    }
  } else if (listing?.legal?.cancellationPolicy === "custom") {
    if (
      Array.isArray(listing?.customRefundPolicies) &&
      listing.customRefundPolicies.length > 0
    ) {
      // Sort policies in descending order by days (highest days first)
      const sortedPolicies = [...listing.customRefundPolicies].sort(
        (a, b) => Number(b.days) - Number(a.days)
      );

      console.log("Days left:", daysLeft);
      console.log("Sorted policies:", sortedPolicies);

      let matched = false;

      // Find the appropriate policy tier
      for (let i = 0; i < sortedPolicies.length; i++) {
        const policyDays = Number(sortedPolicies[i].days);
        const refundPercent = Number(sortedPolicies[i].refundAmount) / 100;

        console.log(`Checking policy: ${policyDays} days, ${refundPercent * 100}% refund`);

        // If daysLeft is greater than or equal to this policy's days threshold
        if (daysLeft >= policyDays) {
          amount = totalAmmount * refundPercent;
          matched = true;
          console.log(`Matched policy: ${policyDays} days, getting ${refundPercent * 100}% refund`);
          break;
        }
      }

      // If no policy matched (daysLeft is less than the smallest threshold)
      if (!matched) {
        // Get the policy with the smallest days value (last in sorted array)
        const smallestPolicy = sortedPolicies[sortedPolicies.length - 1];
        const smallestDays = Number(smallestPolicy.days);
        const smallestRefund = Number(smallestPolicy.refundAmount) / 100;
        
        // If daysLeft is less than the smallest threshold, use that policy's refund
        if (daysLeft < smallestDays) {
          amount = totalAmmount * smallestRefund;
          console.log(`Below smallest threshold (${smallestDays} days), getting ${smallestRefund * 100}% refund`);
        }
      }
    }
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: booking?.paymentIntentId,
      amount: Math.round(amount),
    });

    booking.status = "canceled";
    await booking.save();

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
    const account = await stripe.accounts.create({
      type: "express",
      email: req.body.email,
    });
    console.log(account, "account ka data ", account?.details_submitted);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://waureisen.com/provider/registration?account=failed`,
      return_url: `https://waureisen.com/provider/registration?account=${account.id}`,
      // refresh_url: `http://localhost:5173/provider/registration?account=failed`,
      // return_url: `http://localhost:5173/provider/registration?account=${account.id}`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe Connect onboarding link:", error);
    res.status(500).json({ error: error.message });
  }
};

const getStripeAccount = async (req, res) => {
  try {
    const { accountId } = req?.params;
    // console.log(accountId)
    const account = await stripe.accounts.retrieve(accountId);
    res.json({ data: account });
  } catch (err) {
    console.error("Error creating Stripe Connect onboarding link:", error);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  transferPayment,
  refundPayment,
  getCardDetails,
  createStripeAccount,
  getStripeAccount,
};
