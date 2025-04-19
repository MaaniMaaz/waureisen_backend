// addDummyData.js
const mongoose = require('mongoose');
const Transaction = require('./models/transaction.model');
const Voucher = require('./models/voucher.model');
const User = require('./models/user.model');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
}

async function createDummyTransactions() {
  try {
    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log("Existing transactions cleared");
    
    // Get some existing users
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.error("No users found in the database. Cannot create transactions.");
      return;
    }

    const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay'];
    const statuses = ['paid', 'pending', 'failed', 'refunded', 'canceled', 'confirmed'];
    const listings = ['Mountain View Chalet', 'Beachfront Villa', 'Lake House', 'Forest Cabin', 'City Apartment'];
    
    // Create transactions one by one
    const transactionsCreated = [];
    
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomListing = listings[Math.floor(Math.random() * listings.length)];
      
      // Create a date within the last 6 months
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
      
      // Generate a manual transaction ID to avoid the pre-save middleware issue
      const currentYear = new Date().getFullYear();
      const nextNumber = i + 1;
      const transactionId = `TRX-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
      
      try {
        const transaction = new Transaction({
          transactionId,
          user: randomUser._id,
          amount: {
            chf: Math.floor(Math.random() * 1000) + 100, // Random amount between 100 and 1100
            eur: 0
          },
          status: randomStatus,
          date: date,
          method: randomMethod,
          details: `Booking payment for ${randomListing}`
        });
        
        const savedTransaction = await transaction.save();
        transactionsCreated.push(savedTransaction);
        console.log(`Created transaction with ID: ${transactionId}`);
      } catch (err) {
        console.error(`Error creating transaction #${i+1}:`, err.message);
      }
    }
    
    console.log(`${transactionsCreated.length} transactions created successfully`);
  } catch (error) {
    console.error("Error creating dummy transactions:", error);
  }
}

async function createDummyVouchers() {
  try {
    // Clear existing vouchers
    await Voucher.deleteMany({});
    console.log("Existing vouchers cleared");
    
    // Create dummy voucher data
    const voucherCodes = ['SUMMER2025', 'WELCOME10', 'DOGFRIEND', 'HOLIDAY25', 'SPRING2025'];
    const vouchers = [];
    
    for (let i = 0; i < voucherCodes.length; i++) {
      // Randomly choose between percentage discount and money discount
      const isPercentageDiscount = Math.random() > 0.5;
      
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + Math.floor(Math.random() * 6) + 1);
      
      const voucher = new Voucher({
        code: voucherCodes[i],
        discountPercentage: isPercentageDiscount ? Math.floor(Math.random() * 30) + 5 : 0,
        discountMoney: {
          chf: !isPercentageDiscount ? Math.floor(Math.random() * 100) + 10 : 0,
          eur: 0
        },
        validUntil: validUntil,
        status: Math.random() > 0.2 ? 'active' : 'expired',
        voucherBy: Math.random() > 0.5 ? 'admin' : 'provider'
      });
      
      vouchers.push(voucher);
    }
    
    // Save all vouchers - insertMany works fine for vouchers
    await Voucher.insertMany(vouchers);
    console.log(`${vouchers.length} vouchers created successfully`);
  } catch (error) {
    console.error("Error creating dummy vouchers:", error);
  }
}

async function main() {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error("Failed to connect to the database. Exiting script.");
    process.exit(1);
  }
  
  try {
    await createDummyTransactions();
    await createDummyVouchers();
    console.log("Dummy data creation complete!");
  } catch (error) {
    console.error("Error in script execution:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
}

main();