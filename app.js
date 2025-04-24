require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Add this for socket.io
// const bodyParser = require('body-parser');
const connectDB = require("./configs/database");
const socketServer = require("./socketServer"); // Add this for socket.io
const Booking = require("./models/booking.model.js")
const adminRoutes = require("./routes/admin.routes.js");
const userRoutes = require("./routes/user.routes.js");
const filterRoutes = require("./routes/filter.routes.js");
const languageRoutes = require("./routes/language.routes.js");
const listingRoutes = require("./routes/listing.routes.js");
const providerRoutes = require("./routes/provider.routes.js");
const messageRoutes = require('./routes/message.routes');
const emailNotificationRoutes = require('./routes/emailNotification.routes.js');
const camperRoutes = require('./routes/camper.routes');
const transactionRoutes = require("./routes/transaction.routes.js");
const travelMagazineRoutes = require("./routes/travelMagazine.routes.js");
const voucherRoutes = require("./routes/voucher.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");
const newsletterRoutes = require('./routes/newsletter.routes');
const paymentRoutes = require('./routes/payment.routes.js');
const interhomeRoutes = require('./routes/interhome.routes');
const {CronJob} = require("cron");
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const {handlePayment} = require('./functions/webhook.js');



// const reviewRoutes = require("./routes/review.routes.js")
const chatRoutes = require('./routes/chat.routes'); // Add this for chat routes

const errorHandler = require("./middlewares/errorHandler");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// webhook

const endpointSecret = process.env.WEBHOOK_SECRET;
console.log(endpointSecret)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
     
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
     
      return;
    }
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;

        await handlePayment("success", paymentIntentSucceeded.metadata);
        break;
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        await handlePayment("canceled", paymentIntentCanceled.metadata);
        break;
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object;
        await handlePayment("failed", paymentIntentFailed.metadata);
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
  const today = new Date();

  const bookings = await Booking.find({
    checkInDate: {
      $eq: today.toISOString().split("T")[0], // Adjust based on your DB format
    },
    status:"pending"
  });
  console.log(bookings);
  
  for (const booking of bookings) {
    try {
      const response = await axios.post('http://localhost:5000/api/payment/transfer-payment', {
        connectedAccountId: 'acct_1RHQnw2MRQIK1rqe',
        amount: booking?.totalPrice,
        currency: 'chf',
        bookingId:booking?._id
      });
      console.log("Payout triggered:", response.data);
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
app.use('/api/messages', messageRoutes);
app.use('/api/email-notifications', emailNotificationRoutes);
app.use('/api/campers', camperRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/booking', bookingRoutes);

app.use('/api/providers', providerRoutes);

app.use('/api/interhome', interhomeRoutes);
app.use('/api/chat', chatRoutes); // Add this for chat routes

// Root route
app.get("/", (req, res) => {
  res.send("Waureisen Backend API Running....");
});

// Error handling middleware
app.use(errorHandler);

// Initialize socket server
const io = socketServer.init(server);
console.log('Socket.IO server initialized');

// Handle socket.io errors
io.on('error', (error) => {
  console.error('Socket.IO server error:', error);
});

const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server available at ${PORT}`);
});