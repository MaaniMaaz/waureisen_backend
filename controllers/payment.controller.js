
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET);
console.log(process.env.STRIPE_SECRET);





const createPaymentIntent = async (req, res) => {
  try {
    const { amount,currncy } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userName: req?.user?.name,
        userEmail: req?.user?.email,
        userId: req?.user?.id,
        amount: amount,
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
