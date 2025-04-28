require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Provider = require('./models/provider.model');
const Listing = require('./models/listing.model');
const Booking = require('./models/booking.model');
const bookingNotificationService = require('./services/bookingNotification.service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create a test booking between customer and provider
const createTestBooking = async () => {
  try {
    // Check if customer exists first - create if not present
    const customerEmail = 'i220801@nu.edu.pk';
    let customer = await User.findOne({ email: customerEmail });
    
    if (!customer) {
      console.log(`Customer with email ${customerEmail} not found, creating one...`);
      
      // Create a basic user if not found
      customer = new User({
        username: 'nu_customer',
        email: customerEmail,
        password: '$2a$10$xVLXzo97w0ZVU2IQ5v0QzO7vfE0g0bHm0XgLOHcKFyNcE1xz9X3im', // hashed 'test123'
        firstName: 'Student',
        lastName: 'Customer',
        phoneNumber: '+92 300 1234567',
        terms: ['default_terms'],
        profileStatus: 'verified'
      });
      
      await customer.save();
      console.log(`Created new customer with ID: ${customer._id}`);
    } else {
      console.log(`Found existing customer: ${customer.firstName} ${customer.lastName} (ID: ${customer._id})`);
    }
    
    // Find the provider by email
    const providerEmail = 'i210815@nu.edu.pk';
    const provider = await Provider.findOne({ email: providerEmail });
    
    if (!provider) {
      console.error(`Provider with email ${providerEmail} not found!`);
      return;
    }
    
    console.log(`Found provider: ${provider.firstName} ${provider.lastName} (ID: ${provider._id})`);
    
    // Find one of the provider's listings
    const listings = await Listing.find({ owner: provider._id });
    
    if (listings.length === 0) {
      console.error(`No listings found for provider with ID: ${provider._id}`);
      return;
    }
    
    // Use the first listing
    const listing = listings[4];
    console.log(`Found listing: ${listing.title} (ID: ${listing._id})`);
    
    // Create booking dates for Aug 25 to Aug 28
    const checkInDate = new Date('2025-08-25');
    const checkOutDate = new Date('2025-08-28');
    
    // Generate a mock payment intent ID
    const paymentIntentId = `pi_${Math.random().toString(36).substring(2, 15)}`;
    
    // Calculate total price - you might want to adjust this based on your pricing model
    const totalDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = listing.pricePerNight.price * totalDays;
    
    // Create the booking
    const bookingData = {
      user: customer._id,
      listing: listing._id,
      checkInDate,
      checkOutDate,
      paymentIntentId,
      providerAccountId: provider.stripeAccountId || 'acct_mock123456',
      capacity: {
        people: 2,
        dogs: 1
      },
      totalPrice,
      status: 'pending'
    };
    
    console.log('Creating booking with data:', bookingData);
    
    // Create and save the booking
    const newBooking = new Booking(bookingData);
    await newBooking.save();
    
    console.log(`Booking created successfully! Booking ID: ${newBooking._id}`);
    
    // Since we're creating the booking directly (not through the controller),
    // we need to manually trigger the notification service
    console.log('Manually triggering the email notification service...');
    try {
      const result = await bookingNotificationService.sendBookingNotificationEmail(newBooking);
      console.log('Email notification sent successfully:', result);
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
    }
    
  } catch (error) {
    console.error('Error creating test booking:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
(async () => {
  await connectDB();
  await createTestBooking();
})();