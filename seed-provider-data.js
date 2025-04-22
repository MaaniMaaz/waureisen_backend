// seed-provider-data.js
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

// Create bookings with better distribution for analytics
const createDistributedBookings = async (listings, customers) => {
  const bookings = [];
  const now = new Date();
  
  // Generate 30 days of past bookings (for analytics data)
  for (let i = 0; i < 30; i++) {
    const daysAgo = 30 - i;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);
    
    // Create 1-3 bookings per day for better analytics data
    const bookingsPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < bookingsPerDay; j++) {
      const listing = listings[Math.floor(Math.random() * listings.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      const duration = Math.floor(Math.random() * 4) + 1; // 1-4 nights
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration);
      
      const bookingAmount = duration * listing.pricePerNight.price;
      
      bookings.push({
        user: customer._id,
        listing: listing._id,
        type: 'booking',
        checkInDate: startDate,
        checkOutDate: endDate,
        totalPrice: bookingAmount,
        status: Math.random() > 0.2 ? 'confirmed' : 'pending',
        capacity: {
          people: Math.floor(Math.random() * 3) + 1,
          dogs: Math.floor(Math.random() * 2)
        },
        createdAt: new Date(startDate.getTime() - 86400000 * (Math.floor(Math.random() * 5) + 1))
      });
    }
  }

  // Future bookings for upcoming reservations display
  for (let i = 1; i <= 15; i++) {
    const startDay = Math.floor(Math.random() * 30) + 1;
    const duration = Math.floor(Math.random() * 5) + 1;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + startDay);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);
    const listing = listings[Math.floor(Math.random() * listings.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    const bookingAmount = duration * listing.pricePerNight.price;
    
    bookings.push({
      user: customer._id,
      listing: listing._id,
      type: 'booking',
      checkInDate: startDate,
      checkOutDate: endDate,
      totalPrice: bookingAmount,
      status: Math.random() > 0.5 ? 'confirmed' : 'pending',
      capacity: {
        people: Math.floor(Math.random() * 3) + 1,
        dogs: Math.floor(Math.random() * 2)
      },
      createdAt: new Date()
    });
  }

  return await Booking.insertMany(bookings);
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

    // Create test listings with correct structure expected by the frontend
    const listings = await Listing.insertMany([
      {
        Code: generateListingCode(),
        title: 'Mountain View Chalet',
        description: 'Beautiful chalet with stunning mountain views',
        listingType: 'Chalet',
        location: {
          address: 'Zermatt, Switzerland',
          type: 'Point',  // Important - this must be 'Point' for GeoJSON
          coordinates: [7.7482, 46.0207]  // [longitude, latitude] order for GeoJSON
        },
        pricePerNight: {
          price: 300,
          currency: 'CHF'
        },
        images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'],
        status: 'active',  // Set to active to ensure it appears in listings
        owner: provider._id,
        ownerType: 'Provider',
        provider: 'Waureisen',
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        totalBookings: 0,  // Will update this after creating bookings
        totalViews: 45,
        totalRating: 4.7
      },
      {
        Code: generateListingCode(),
        title: 'Lakeside Apartment',
        description: 'Modern apartment by the lake with beautiful views',
        listingType: 'Apartment',
        location: {
          address: 'Lucerne, Switzerland',
          type: 'Point',
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
        },
        totalBookings: 0,
        totalViews: 38,
        totalRating: 4.5
      },
      {
        Code: generateListingCode(),
        title: 'Cozy Alpine Cabin',
        description: 'Rustic cabin surrounded by nature',
        listingType: 'Cabin',
        location: {
          address: 'Interlaken, Switzerland',
          type: 'Point',
          coordinates: [7.8632, 46.6863]
        },
        pricePerNight: {
          price: 180,
          currency: 'CHF'
        },
        images: ['https://images.unsplash.com/photo-1587061949409-02df41d5e562'],
        status: 'active',
        owner: provider._id,
        ownerType: 'Provider',
        provider: 'Waureisen',
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        totalBookings: 0,
        totalViews: 27,
        totalRating: 4.3
      }
    ]);

    // Create distributed bookings for analytics
    const createdBookings = await createDistributedBookings(listings, customers);
    console.log(`Created ${createdBookings.length} distributed bookings`);

    // Update the totalBookings count for each listing
    for (const listing of listings) {
      const bookingCount = await Booking.countDocuments({ 
        listing: listing._id, 
        status: { $in: ['confirmed', 'pending'] } 
      });
      
      await Listing.findByIdAndUpdate(listing._id, { 
        totalBookings: bookingCount
      });
      
      console.log(`Updated listing ${listing.title} with ${bookingCount} bookings`);
    }

    // Create some blocked dates
    await UnavailableDate.insertMany([
      {
        listing: listings[0]._id,
        date: createDate(30),
        reason: 'maintenance',
        createdBy: provider._id,
        createdByType: 'Provider'
      },
      {
        listing: listings[1]._id,
        date: createDate(35),
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