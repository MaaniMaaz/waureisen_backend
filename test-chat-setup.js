// test-chat-setup.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Provider = require('./models/provider.model');
const Listing = require('./models/listing.model');
const Booking = require('./models/booking.model');

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Find the existing provider and customer
    const provider = await Provider.findOne({ email: 'provider@test.com' });
    if (!provider) {
      throw new Error('Provider with email provider@test.com not found');
    }

    const customer = await User.findOne({ email: 'customer1@test.com' });
    if (!customer) {
      throw new Error('Customer with email customer1@test.com not found');
    }

    console.log(`Found provider: ${provider.username} (${provider._id})`);
    console.log(`Found customer: ${customer.username} (${customer._id})`);

    // 2. Create a new listing for the provider in Pakistan
    const newListing = new Listing({
      Code: 'WR' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      title: 'Hotel in Islamabad',
      description: {
        general: 'Beautiful luxury villa with stunning views of the Margalla Hills',
        inside: 'Spacious interiors with modern amenities and comfortable furnishings',
        outside: 'Large garden with outdoor seating area and barbecue'
      },
      listingType: 'Villa',
      location: {
        address: 'Islamabad, Pakistan',
        type: 'Point',
        coordinates: [73.0479, 33.6844] // Islamabad coordinates
      },
      pricePerNight: {
        price: 200,
        currency: 'CHF'
      },
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'], // Example image
      beds: 3,
      bedRooms: 2,
      washrooms: 2,
      maxDogs: 2,
      status: 'active',
      owner: provider._id,
      ownerType: 'Provider',
      provider: 'Waureisen',
      source: {
        name: 'waureisen', // Important - this must be 'waureisen' for chat to work
        redirectLink: null
      },
      totalBookings: 0,
      totalViews: 0,
      totalRating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedListing = await newListing.save();
    console.log(`Created new listing: ${savedListing.title} (${savedListing._id})`);

    // Add listing reference to provider
    if (!provider.listings) {
      provider.listings = [];
    }
    provider.listings.push(savedListing._id);
    await provider.save();

    // 3. Create a booking request from the customer for that listing
    const checkInDate = new Date('2025-06-25T00:00:00.000Z');
    const checkOutDate = new Date('2025-06-30T00:00:00.000Z');
    
    const newBooking = new Booking({
      user: customer._id,
      listing: savedListing._id,
      type: 'booking',
      checkInDate,
      checkOutDate,
      totalPrice: 5 * savedListing.pricePerNight.price, // 5 nights
      status: 'pending', // Set as pending so provider can accept it
      capacity: {
        people: 2,
        dogs: 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedBooking = await newBooking.save();
    console.log(`Created new booking: ${savedBooking._id} (status: ${savedBooking.status})`);

    // Add booking reference to customer
    if (!customer.bookings) {
      customer.bookings = [];
    }
    customer.bookings.push(savedBooking._id);
    await customer.save();

    console.log('\nTest setup completed successfully!');
    console.log('\nTo test the chat functionality:');
    console.log('1. Login as the provider (provider@test.com)');
    console.log('2. Go to the bookings page and accept the pending booking');
    console.log('3. Check that a conversation is created and the initial message is sent');
    console.log('4. Login as the customer (customer1@test.com) and check their messages');

  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the setup
setupTestData();