// seedProviderData.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Provider = require('./models/provider.model');
const User = require('./models/user.model');
const Listing = require('./models/listing.model');
const Booking = require('./models/booking.model');
const UnavailableDate = require('./models/unavailableDate.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper function to create date with no time
const createDate = (daysFromNow = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Helper function to generate unique listing code
const generateListingCode = () => {
  return 'WR' + Math.random().toString(36).substring(2, 7).toUpperCase();
};

async function seedData() {
  try {
    // Clear existing data
    await Provider.deleteMany({});
    await User.deleteMany({ email: { $in: ['customer1@test.com', 'customer2@test.com'] }});
    await Listing.deleteMany({ ownerType: 'Provider' });
    await Booking.deleteMany({});
    await UnavailableDate.deleteMany({});

    // Create test provider
    const hashedPassword = await bcrypt.hash('test123', 10);
    const provider = await Provider.create({
      username: 'testprovider',
      email: 'provider@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Provider',
      phoneNumber: '+41789999999',
      profileStatus: 'verified',
      role: 'provider'
    });

    // Create test customers
    const customers = await User.insertMany([
      {
        username: 'customer1',
        email: 'customer1@test.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        terms: ['default_terms'],
        profileStatus: 'verified'
      },
      {
        username: 'customer2',
        email: 'customer2@test.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        terms: ['default_terms'],
        profileStatus: 'verified'
      }
    ]);

    // Create test listings
    const listings = await Listing.insertMany([
      {
        Code: generateListingCode(), // Added unique code
        title: 'Mountain View Chalet',
        description: 'Beautiful chalet with stunning mountain views',
        listingType: 'Chalet',
        location: {
          address: 'Zermatt, Switzerland',
          coordinates: [7.7482, 46.0207]
        },
        pricePerNight: {
          price: 300,
          currency: 'CHF'
        },
        images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'],
        status: 'active',
        owner: provider._id,
        ownerType: 'Provider',
        provider: 'Waureisen',
        source: {
          name: 'waureisen',
          redirectLink: null
        }
      },
      {
        Code: generateListingCode(), // Added unique code
        title: 'Lakeside Apartment',
        description: 'Modern apartment by the lake',
        listingType: 'Apartment',
        location: {
          address: 'Lucerne, Switzerland',
          coordinates: [8.3093, 47.0502]
        },
        pricePerNight: {
          price: 250,
          currency: 'CHF'
        },
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
        status: 'active',
        owner: provider._id,
        ownerType: 'Provider',
        provider: 'Waureisen',
        source: {
          name: 'waureisen',
          redirectLink: null
        }
      }
    ]);

    // Create bookings for the listings
    const bookings = await Booking.insertMany([
      {
        user: customers[0]._id,
        listing: listings[0]._id,
        type: 'booking',
        checkInDate: createDate(7), // 7 days from now
        checkOutDate: createDate(10), // 10 days from now
        totalPrice: 900,
        status: 'confirmed',
        capacity: {
          people: 2,
          dogs: 1
        }
      },
      {
        user: customers[1]._id,
        listing: listings[0]._id,
        type: 'booking',
        checkInDate: createDate(14), // 14 days from now
        checkOutDate: createDate(16), // 16 days from now
        totalPrice: 600,
        status: 'pending',
        capacity: {
          people: 3,
          dogs: 0
        }
      },
      {
        user: customers[0]._id,
        listing: listings[1]._id,
        type: 'booking',
        checkInDate: createDate(21), // 21 days from now
        checkOutDate: createDate(25), // 25 days from now
        totalPrice: 1000,
        status: 'confirmed',
        capacity: {
          people: 2,
          dogs: 1
        }
      }
    ]);

    // Create some blocked dates
    await UnavailableDate.insertMany([
      {
        listing: listings[0]._id,
        date: createDate(30), // 30 days from now
        reason: 'maintenance',
        createdBy: provider._id,
        createdByType: 'Provider'
      },
      {
        listing: listings[1]._id,
        date: createDate(35), // 35 days from now
        reason: 'personal',
        createdBy: provider._id,
        createdByType: 'Provider'
      }
    ]);

    console.log('Seed data created successfully!');
    console.log('\nTest Provider Login:');
    console.log('Email: provider@test.com');
    console.log('Password: test123');
    console.log('\nTest Customer Logins:');
    console.log('Email: customer1@test.com');
    console.log('Email: customer2@test.com');
    console.log('Password: test123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedData();