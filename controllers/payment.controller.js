const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const moment = require("moment");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Listing = require("../models/listing.model");
const Payment = require("../models/payment.model");
const { sendCancelBooking } = require("../services/email.service");
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
      destination: "acct_1QPmjyRuFURKkwuQ",
    });
    
    if (transfer?.id && transfer2?.id) {
      
      await Booking.findByIdAndUpdate(bookingId, {isPayoutReleased:true  });
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

  const booking = await Booking.findById(bookingId).populate("user provider");
  const listing = await Listing.findById(booking?.listing);
  console.log(booking, "booking ka data", listing?.legal?.cancellationPolicy);
  
  let refundPercentage = 0;
  const totalAmount = booking?.totalPrice * 100; // Convert to cents for Stripe
  const targetDate = moment(booking?.checkInDate).startOf("day");
  const now = moment().startOf("day");
  const daysLeft = targetDate.diff(now, "days");

  // Calculate refund percentage based on cancellation policy
  if (listing?.legal?.cancellationPolicy === "Flexible (Full refund 1 day prior to arrival)") {
    if (daysLeft > 1) {
      refundPercentage = 1.0; // 100%
    } else if (daysLeft > 0) {
      refundPercentage = 0.5; // 50%
    } else {
      refundPercentage = 0; // 0%
    }
  } else if (listing?.legal?.cancellationPolicy === "Moderate (Full refund 5 days prior to arrival)") {
    if (daysLeft > 5) {
      refundPercentage = 1.0; // 100%
    } else if (daysLeft > 4) {
      refundPercentage = 0.5; // 50%
    } else if (daysLeft > 3) {
      refundPercentage = 0.6; // 60%
    } else if (daysLeft > 2) {
      refundPercentage = 0.7; // 70%
    } else if (daysLeft > 1) {
      refundPercentage = 0.8; // 80%
    } else if (daysLeft > 0) {
      refundPercentage = 0.9; // 90%
    } else {
      refundPercentage = 0; // 0%
    }
  } else if (listing?.legal?.cancellationPolicy === "Strict (50% refund up to 1 week prior to arrival)") {
    if (daysLeft > 6) {
      refundPercentage = 0.5; // 50%
    } else if (daysLeft > 5) {
      refundPercentage = 0.6; // 60%
    } else if (daysLeft > 4) {
      refundPercentage = 0.7; // 70%
    } else if (daysLeft > 3) {
      refundPercentage = 0.8; // 80%
    } else if (daysLeft > 2) {
      refundPercentage = 0.9; // 90%
    } else {
      refundPercentage = 0; // 0%
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

      let matched = false;

      // Find the appropriate policy tier
      for (let i = 0; i < sortedPolicies.length; i++) {
        const policyDays = Number(sortedPolicies[i].days);
        const refundPercent = Number(sortedPolicies[i].refundAmount) / 100;

        // If daysLeft is greater than or equal to this policy's days threshold
        if (daysLeft >= policyDays) {
          refundPercentage = refundPercent;
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
          refundPercentage = smallestRefund;
          console.log(`Below smallest threshold (${smallestDays} days), getting ${smallestRefund * 100}% refund`);
        }
      }
    }
  }

  // Calculate the refund amount after deducting Stripe fee (2.9%)
  const stripeFeePercentage = 0.029; // 2.9%
  const eligibleRefundAmount = totalAmount * refundPercentage;
  
  // Deduct Stripe fee from the eligible refund amount
  const stripeFeeDeduction = totalAmount * stripeFeePercentage;
  const finalRefundAmount = Math.max(0, eligibleRefundAmount - stripeFeeDeduction);

  console.log(`Original amount: ${totalAmount / 100}`);
  console.log(`Refund percentage: ${refundPercentage * 100}%`);
  console.log(`Eligible refund before Stripe fee: ${eligibleRefundAmount / 100}`);
  console.log(`Stripe fee deduction: ${stripeFeeDeduction / 100}`);
  console.log(`Final refund amount: ${finalRefundAmount / 100}`);

  try {
    let refund ;
    if (Math.round(finalRefundAmount) > 0){

      refund = await stripe.refunds.create({
        payment_intent: booking?.paymentIntentId,
        amount: Math.round(finalRefundAmount),
      });
    }else {
      refund = `You booking has been canceled with ${Math.round(finalRefundAmount)} refund amount`
    }


    booking.status = "canceled";
    await booking.save();

    res.status(200).json({ 
      success: true, 
      refund,
      refundDetails: {
        originalAmount: totalAmount / 100,
        refundPercentage: refundPercentage * 100,
        eligibleRefund: eligibleRefundAmount / 100,
        stripeFeeDeducted: stripeFeeDeduction / 100,
        finalRefundAmount: finalRefundAmount / 100
      }
    });
    await sendCancelBooking(booking?.provider?.email , booking , listing)
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
    const {accountId} = req.body
    let account;
    if(!accountId){

      account = await stripe.accounts.create({
        type: "express",
        email: req.body.email,
      });
    }
    console.log(account, "account ka data ", account?.details_submitted);

    const accountLink = await stripe.accountLinks.create({
      account: accountId || account.id,
       refresh_url: `https://enchanting-sunshine-e99689.netlify.app/provider/registration?account=failed`,
      return_url: `https://enchanting-sunshine-e99689.netlify.app/registration?account=${accountId || account.id}`,
      // refresh_url: `https://waureisen.com/provider/registration?account=failed`,
      // return_url: `https://waureisen.com/provider/registration?account=${accountId || account.id}`,
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
    console.error("Error creating Stripe Connect onboarding link:", err);
    res.status(500).json({ error: err.message });
  }
};


const recordSuccessfulTransaction = async (paymentIntent) => {
  try {
    const metadata = paymentIntent.metadata;
    console.log(paymentIntent , "intent")
    // Create payment record
    const payment = new Payment({
      userId: metadata.userId,
      bookingId: null, // Will be updated when booking is created
      amount: parseFloat(metadata.amount),
      status: 'success',
      transactionId: paymentIntent.id,
      currency: metadata.currency,
      method: 'card',
      details: `Booking payment - ${metadata.amount} ${metadata.currency.toUpperCase()}`,
      date: new Date(),
      // Store additional payment breakdown
      fees: {
        stripeFee: parseFloat(metadata.stripeFeeAmount),
        platformFee: parseFloat(metadata.platformFeeAmount),
        providerAmount: parseFloat(metadata.providerAmount)
      }
    });

    await payment.save();
    console.log('Transaction recorded:', payment._id);
    
    return payment;
  } catch (error) {
    console.error('Error recording transaction:', error);
  }
};

const getAllTransactions = async (req, res) => {
  try {
    // First, let's get data from bookings since that's where your payment data currently lives
    const bookings = await Booking.find({ status: { $ne: 'pending' } })
      .populate('user', 'firstName lastName username email customerNumber')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    // Transform booking data to transaction format
    const transactions = bookings.map(booking => {
      const user = booking.user || {};
      const amount = booking.totalPrice || 0;
      const currency = booking.currency || 'EUR';
      
      return {
        _id: booking._id,
        transactionId: booking.paymentIntentId || booking._id,
        user: {
          _id: user._id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          email: user.email || '',
          customerNumber: user.customerNumber || ''
        },
        amount: {
          [currency.toLowerCase()]: amount,
          chf: currency.toUpperCase() === 'CHF' ? amount : 0,
          eur: currency.toUpperCase() === 'EUR' ? amount : 0
        },
        currency: currency,
        method: 'card',
        details: `Booking payment - ${booking.listing?.title || 'Property'} (${booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'} - ${booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'})`,
        status: booking.status === 'confirmed' ? 'paid' : booking.status,
        date: booking.createdAt,
        booking: booking
      };
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
};


const updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    // Update booking status since that's where your data lives
    const booking = await Booking.findByIdAndUpdate(
      transactionId,
      { status: status === 'canceled' ? 'canceled' : status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: error.message });
  }
};


const handlePaymentSuccess = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.log('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    console.log(event?.data?.object , event.type , "klok")
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      await recordSuccessfulTransaction(paymentIntent);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createPaymentIntent,
  transferPayment,
  refundPayment,
  getCardDetails,
  createStripeAccount,
  getStripeAccount,
  handlePaymentSuccess,
  getAllTransactions,
  updateTransactionStatus,
};
