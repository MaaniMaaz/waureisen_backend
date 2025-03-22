require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/database");

const adminRoutes = require("./routes/admin.routes.js");
const userRoutes = require("./routes/user.routes.js");
const filterRoutes = require("./routes/filter.routes.js");
const languageRoutes = require("./routes/language.routes.js");
const listingRoutes = require("./routes/listing.routes.js");
const providerRoutes = require("./routes/provider.routes.js");
const messageRoutes = require('./routes/message.routes');
// const reviewRoutes = require("./routes/review.routes.js");
const transactionRoutes = require("./routes/transaction.routes.js");
const travelMagazineRoutes = require("./routes/travelMagazine.routes.js");
const voucherRoutes = require("./routes/voucher.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/admins", adminRoutes);

app.use("/api/users", userRoutes);

app.use("/api/filters", filterRoutes);

app.use("/api/languages", languageRoutes);

app.use("/api/listings", listingRoutes);

app.use("/api/providers", providerRoutes);

// TBD
//app.use("/api/reviews", reviewRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/travel-magazine", travelMagazineRoutes);

app.use("/api/vouchers", voucherRoutes);

app.use('/api/messages', messageRoutes);

app.get("/", (req, res) => {
  res.send("Waureisen Backend API Running....");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});