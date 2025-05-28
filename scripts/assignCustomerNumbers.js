const mongoose = require('mongoose');
const User = require('../models/user.model');

const MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025CHECK?retryWrites=true&w=majority&appName=ClusterWork';

async function generateUniqueCustomerNumber() {
  let isUnique = false;
  let customerNumber;
  
  while (!isUnique) {
    // Generate random 5-digit number
    const randomNum = Math.floor(10000 + Math.random() * 90000).toString();
    customerNumber = `WAU-2025-${randomNum}`;
    
    // Check if number already exists
    const existingUser = await User.findOne({ customerNumber });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return customerNumber;
}

async function assignCustomerNumbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users whose customer number doesn't start with WAU-2025
    const users = await User.find({
      $or: [
        { customerNumber: { $exists: false } },
        { customerNumber: { $not: /^WAU-2025-/ } }
      ]
    });
    
    console.log(`Found ${users.length} users that need customer number updates`);

    // Assign customer numbers to each user
    for (const user of users) {
      const customerNumber = await generateUniqueCustomerNumber();
      user.customerNumber = customerNumber;
      await user.save();
      console.log(`Assigned customer number ${customerNumber} to user ${user.username}`);
    }

    console.log('Finished assigning customer numbers');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
assignCustomerNumbers(); 