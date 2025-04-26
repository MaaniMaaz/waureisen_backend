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

    // 1. Find existing provider and customer
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

    // 2. Create a new listing for the provider
    const newListing = new Listing({
      Code: `WR-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Luxury Mountain Villa with Dog Facilities',
      description: {
        general: 'Beautiful luxury villa with stunning views of the mountains',
        inside: 'Spacious interiors with modern amenities and comfortable furnishings',
        outside: 'Large garden with outdoor seating area and dedicated dog play area'
      },
      listingType: 'Villa',
      location: {
        address: 'Mountain View, Switzerland',
        type: 'Point',
        coordinates: [8.5417, 47.3769] // Swiss coordinates
      },
      pricePerNight: {
        price: 250,
        currency: 'CHF'
      },
      maxDogs: 3, // Allow up to 3 dogs
      bedRooms: 3,
      beds: 5,
      washrooms: 2,
      status: 'active',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      owner: provider._id,
      ownerType: 'Provider',
      provider: 'Waureisen',
      source: {
        name: 'waureisen', // Important - this must be 'waureisen' for chat to work
        redirectLink: null
      },
      selectedFilters: {
        dogFilters: [
          { name: 'Firework Free Zone', icon: 'fire' },
          { name: 'Dog Parks Nearby', icon: 'park' }
        ]
      },
      totalBookings: 0,
      totalViews: 0,
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

    // 3. Create a booking with multiple guests and dogs
    const checkInDate = new Date('2025-06-25T00:00:00.000Z');
    const checkOutDate = new Date('2025-06-30T00:00:00.000Z');
    
    // Calculate the total price for 5 nights
    const totalNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = totalNights * savedListing.pricePerNight.price;
    
    // Create a unique booking ID for easier reference
    const bookingId = `WR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newBooking = new Booking({
      user: customer._id,
      listing: savedListing._id,
      type: 'booking',
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'pending', // Set as pending so provider can accept it
      capacity: {
        people: 4, // Multiple guests
        dogs: 2    // Multiple dogs
      },
      // Add any additional fields that might be needed
      bookingId, // Custom booking ID for reference
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedBooking = await newBooking.save();
    console.log(`Created new booking: ${savedBooking._id} (status: ${savedBooking.status})`);
    console.log(`Booking details: ${savedBooking.capacity.people} guests, ${savedBooking.capacity.dogs} dogs`);
    console.log(`Booking ID: ${bookingId}`);

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
    console.log('4. Verify the booking details shown in the chat header (guests, dogs, booking ID)');
    console.log('5. Login as the customer (customer1@test.com) and check their messages');

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