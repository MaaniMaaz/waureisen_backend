require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const socketIo = require('socket.io');
const connectDB = require("./configs/database");
const Booking = require("./models/booking.model.js")
const adminRoutes = require("./routes/admin.routes.js");
const userRoutes = require("./routes/user.routes.js");
const filterRoutes = require("./routes/filter.routes.js");
const languageRoutes = require("./routes/language.routes.js");
const listingRoutes = require("./routes/listing.routes.js");
const providerRoutes = require("./routes/provider.routes.js");
const emailNotificationRoutes = require("./routes/emailNotification.routes.js");
const camperRoutes = require("./routes/camper.routes");
const transactionRoutes = require("./routes/transaction.routes.js");
const travelMagazineRoutes = require("./routes/travelMagazine.routes.js");
const voucherRoutes = require("./routes/voucher.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");
const conversationRoutes = require('./routes/conversation.routes');

const {CronJob} = require("cron");
const axios = require("axios");
const newsletterRoutes = require("./routes/newsletter.routes");
const paymentRoutes = require("./routes/payment.routes.js");
const interhomeRoutes = require("./routes/interhome.routes");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { handlePayment } = require("./functions/webhook.js");

// const reviewRoutes = require("./routes/review.routes.js")

const errorHandler = require("./middlewares/errorHandler");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Set up Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "profile-status"],
  })
);

// Make io available in the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize socket handlers
require('./sockets/chat.socket')(io);

// webhook
const endpointSecret = process.env.WEBHOOK_SECRET;
console.log(endpointSecret);
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log(event?.type);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      console.log(event?.type, err);
      return;
    }
    console.log(event?.data);
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;

        await handlePayment("success", paymentIntentSucceeded.metadata ,event.data.object);
        break;
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        await handlePayment("canceled", paymentIntentCanceled.metadata,event.data.object);
        break;
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object;
        await handlePayment("failed", paymentIntentFailed.metadata,event.data.object);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send({ received: true });
  }
);

// cron job for transfer payment
const scheduleTransferPaymnetJob = new CronJob("* * * * *", 
  async () => {
  console.log("Running daily payout job...");

  const startOfDay = new Date();
startOfDay.setUTCHours(0, 0, 0, 0); // 00:00:00 UTC

const endOfDay = new Date();
endOfDay.setUTCHours(23, 59, 59, 999); // 23:59:59 UTC

  const bookings = await Booking.find({
    checkInDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status:"pending"
  });
  
  for (const booking of bookings) {
    try {
      const response = await axios.post('https://waureisen-backend.onrender.com/api/payment/transfer-payment', {
        connectedAccountId: booking?.providerAccountId,
        amount: booking?.totalPrice,
        currency: 'chf',
        bookingId:booking?._id
      });
  } catch (err) {
    console.error("Failed to make payout:", err.message);
  }
  }
},null,                
true,                
"UTC" )
scheduleTransferPaymnetJob.start()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/travel-magazine", travelMagazineRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use('/api/email-notifications', emailNotificationRoutes);
app.use('/api/campers', camperRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/conversations', conversationRoutes);
app.use("/api/interhome", interhomeRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Waureisen Backend API Running....");
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});