require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Add this for socket.io
const connectDB = require("./configs/database");
const socketServer = require("./socketServer"); // Add this for socket.io

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
const interhomeRoutes = require('./routes/interhome.routes');


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