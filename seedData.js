// seedData.js - Run with Node.js to populate database with dummy data
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin.model");
const User = require("./models/user.model");
const Provider = require("./models/provider.model");
const Listing = require("./models/listing.model");
const Booking = require("./models/booking.model");
const Transaction = require("./models/transaction.model");
const Filter = require("./models/filter.model");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Hash password helper
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Generate 6-digit customer number
const generateCustomerNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clear existing data (optional, remove if you want to keep existing data)
const clearExistingData = async () => {
  await Admin.deleteMany({});
  await User.deleteMany({});
  await Provider.deleteMany({});
  await Listing.deleteMany({});
  await Booking.deleteMany({});
  await Transaction.deleteMany({});
  await Filter.deleteMany({});
  console.log("Cleared existing data");
};

// Create admin users
const createAdmins = async () => {
  const hashedPassword = await hashPassword("admin123");
  
  const adminData = [
    {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin"
    },
    {
      username: "superadmin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "admin"
    }
  ];
  
  const admins = await Admin.insertMany(adminData);
  console.log(`${admins.length} admins created`);
  return admins;
};

// Create regular users
const createUsers = async () => {
  const hashedPassword = await hashPassword("password123");
  
  const userData = [
    {
      username: "johndoe",
      email: "john.doe@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+41 76 123 4567",
      aboutYou: "I love traveling with my dog!",
      dateOfBirth: "1985-05-15",
      nationality: "Swiss",
      gender: "Male",
      customerNumber: generateCustomerNumber(),
      terms: ["default_terms"],
      profileStatus: "verified",
      dogs: [{ name: "Max", gender: "Male" }],
      bookings: [],
      totalBookings: 12
    },
    {
      username: "janesmith",
      email: "jane.smith@example.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      phoneNumber: "+41 78 456 7890",
      aboutYou: "Adventure seeker with my labrador",
      dateOfBirth: "1990-03-20",
      nationality: "German",
      gender: "Female",
      customerNumber: generateCustomerNumber(),
      terms: ["default_terms"],
      profileStatus: "verified",
      dogs: [{ name: "Bella", gender: "Female" }],
      bookings: [],
      totalBookings: 8
    },
    {
      username: "robertbrown",
      email: "robert.brown@example.com",
      password: hashedPassword,
      firstName: "Robert",
      lastName: "Brown",
      phoneNumber: "+41 79 789 0123",
      aboutYou: "Looking for pet friendly accommodations",
      dateOfBirth: "1978-11-30",
      nationality: "Austrian",
      gender: "Male",
      customerNumber: generateCustomerNumber(),
      terms: ["default_terms"],
      profileStatus: "banned",
      dogs: [{ name: "Charlie", gender: "Male" }],
      bookings: [],
      totalBookings: 3
    },
    {
      username: "emmawilson",
      email: "emma.wilson@example.com",
      password: hashedPassword,
      firstName: "Emma",
      lastName: "Wilson",
      phoneNumber: "+41 76 234 5678",
      aboutYou: "I enjoy cozy cabins with my pet",
      dateOfBirth: "1992-08-12",
      nationality: "French",
      gender: "Female",
      customerNumber: generateCustomerNumber(),
      terms: ["default_terms"],
      profileStatus: "verified",
      dogs: [{ name: "Luna", gender: "Female" }],
      bookings: [],
      totalBookings: 5
    },
    {
      username: "michaeljohnson",
      email: "michael.johnson@example.com",
      password: hashedPassword,
      firstName: "Michael",
      lastName: "Johnson",
      phoneNumber: "+41 78 567 8901",
      aboutYou: "Mountain lover with two dogs",
      dateOfBirth: "1982-01-25",
      nationality: "Italian",
      gender: "Male",
      customerNumber: generateCustomerNumber(),
      terms: ["default_terms"],
      profileStatus: "verified",
      dogs: [
        { name: "Rocky", gender: "Male" },
        { name: "Daisy", gender: "Female" }
      ],
      bookings: [],
      totalBookings: 9
    }
  ];
  
  const users = await User.insertMany(userData);
  console.log(`${users.length} users created`);
  return users;
};

// Create providers
const createProviders = async () => {
  const hashedPassword = await hashPassword("provider123");
  
  const providerData = [
    {
      username: "luxuryproperties",
      email: "contact@luxuryproperties.com",
      password: hashedPassword,
      phoneNumber: "+41 76 123 4567",
      firstName: "Luxury",
      lastName: "Properties",
      displayName: "Luxury Properties Inc.",
      bio: "We offer the finest luxury accommodations for you and your pets.",
      profileStatus: "verified",
      role: "provider",
      listings: []
    },
    {
      username: "alpinehomes",
      email: "info@alpinehomes.com",
      password: hashedPassword,
      phoneNumber: "+41 78 456 7890",
      firstName: "Alpine",
      lastName: "Homes",
      displayName: "Alpine Homes",
      bio: "Cozy mountain retreats that welcome your furry friends.",
      profileStatus: "verified",
      role: "provider",
      listings: []
    },
    {
      username: "beachvillas",
      email: "bookings@beachvillas.com",
      password: hashedPassword,
      phoneNumber: "+41 79 789 0123",
      firstName: "Beach",
      lastName: "Villas",
      displayName: "Beach Villas Co.",
      bio: "Seaside accommodations for you and your pets.",
      profileStatus: "banned",
      role: "provider",
      listings: []
    },
    {
      username: "citystays",
      email: "info@citystays.com",
      password: hashedPassword,
      phoneNumber: "+41 76 234 5678",
      firstName: "City",
      lastName: "Stays",
      displayName: "City Stays",
      bio: "Urban accommodations that welcome pets.",
      profileStatus: "verified",
      role: "provider",
      listings: []
    },
    {
      username: "mountainretreats",
      email: "bookings@mountainretreats.com",
      password: hashedPassword,
      phoneNumber: "+41 78 567 8901",
      firstName: "Mountain",
      lastName: "Retreats",
      displayName: "Mountain Retreats",
      bio: "Scenic mountain accommodations for you and your dogs.",
      profileStatus: "verified",
      role: "provider",
      listings: []
    }
  ];
  
  const providers = await Provider.insertMany(providerData);
  console.log(`${providers.length} providers created`);
  return providers;
};

// Create sample filters
const createFilters = async () => {
  const filterData = {
    name: "Main Filters",
    generalFilters: [
      { name: "Kitchen", icon: "kitchen" },
      { name: "Air Conditioning", icon: "air_conditioning" },
      { name: "Parking", icon: "parking" },
      { name: "WiFi", icon: "wifi" },
      { name: "Dedicated workspace", icon: "workspace" },
      { name: "TV", icon: "tv" },
      { name: "Swimming Pool", icon: "pool" }
    ],
    mainFilters: [
      { name: "Dog allowed in the restaurant", icon: "restaurant_dog" },
      { name: "Parking at the accommodation", icon: "parking" },
      { name: "Free cancellation", icon: "cancel" },
      { name: "Private pool", icon: "pool" },
      { name: "Kids friendly", icon: "kids" }
    ],
    dogFilters: [
      { name: "Firework Free Zone", icon: "firework_free" },
      { name: "Dog-friendly restaurants nearby", icon: "restaurant_dog" },
      { name: "Fenced garden", icon: "garden" },
      { name: "Dog bed provided", icon: "dog_bed" },
      { name: "Dog towels provided", icon: "dog_towels" }
    ]
  };
  
  const filter = await Filter.create(filterData);
  console.log("Filters created");
  return filter;
};

// Create listings
const createListings = async (providers, filter) => {
  // Helper function to get a random provider
  const getRandomProvider = () => {
    return providers[Math.floor(Math.random() * providers.length)];
  };
  
  // Helper function to get random filters
  const getRandomFilters = (filterArray, count) => {
    const shuffled = [...filterArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  const listingData = [
    {
      title: "Mountain View Chalet",
      description: "Beautiful chalet with panoramic mountain views, perfect for a getaway with your furry friend.",
      listingType: "Chalet",
      checkInTime: new Date("2023-06-15T14:00:00"),
      checkOutTime: new Date("2023-06-15T11:00:00"),
      location: {
        address: "Swiss Alps, Switzerland",
        coordinates: [8.227512, 46.818188] // [longitude, latitude]
      },
      pricePerNight: {
        price: 250,
        currency: "CHF"
      },
      capacity: {
        people: 6,
        dogs: 2,
        bedrooms: 3,
        rooms: 5,
        washrooms: 2
      },
      photos: [
        "https://example.com/mountain-chalet1.jpg",
        "https://example.com/mountain-chalet2.jpg",
        "https://example.com/mountain-chalet3.jpg"
      ],
      status: "active",
      totalRating: 4.7,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 4),
        dogFilters: getRandomFilters(filter.dogFilters, 3)
      }
    },
    {
      title: "Beachfront Villa",
      description: "Luxurious villa with direct beach access. Spacious garden for your dogs to play.",
      listingType: "Villa",
      checkInTime: new Date("2023-06-15T15:00:00"),
      checkOutTime: new Date("2023-06-15T10:00:00"),
      location: {
        address: "Costa Brava, Spain",
        coordinates: [3.1883, 41.9794] // [longitude, latitude]
      },
      pricePerNight: {
        price: 350,
        currency: "CHF"
      },
      capacity: {
        people: 8,
        dogs: 3,
        bedrooms: 4,
        rooms: 6,
        washrooms: 3
      },
      photos: [
        "https://example.com/beach-villa1.jpg",
        "https://example.com/beach-villa2.jpg",
        "https://example.com/beach-villa3.jpg"
      ],
      status: "active",
      totalRating: 4.9,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 5),
        dogFilters: getRandomFilters(filter.dogFilters, 4)
      }
    },
    {
      title: "Lake House",
      description: "Serene lake house with private dock. Dog-friendly with fenced yard.",
      listingType: "House",
      checkInTime: new Date("2023-06-15T16:00:00"),
      checkOutTime: new Date("2023-06-15T10:00:00"),
      location: {
        address: "Lake Como, Italy",
        coordinates: [9.2651, 45.9833] // [longitude, latitude]
      },
      pricePerNight: {
        price: 400,
        currency: "CHF"
      },
      capacity: {
        people: 6,
        dogs: 2,
        bedrooms: 3,
        rooms: 4,
        washrooms: 2
      },
      photos: [
        "https://example.com/lake-house1.jpg",
        "https://example.com/lake-house2.jpg",
        "https://example.com/lake-house3.jpg"
      ],
      status: "closed",
      totalRating: 4.6,
      source: {
        name: "interhome",
        redirectLink: "https://www.interhome.com/lakehouse"
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 3),
        dogFilters: getRandomFilters(filter.dogFilters, 2)
      }
    },
    {
      title: "Cozy Mountain Cabin",
      description: "Rustic cabin in the woods. Perfect for hiking with your dog.",
      listingType: "Cabin",
      checkInTime: new Date("2023-06-15T15:00:00"),
      checkOutTime: new Date("2023-06-15T11:00:00"),
      location: {
        address: "Zermatt, Switzerland",
        coordinates: [7.7484, 46.0207] // [longitude, latitude]
      },
      pricePerNight: {
        price: 180,
        currency: "CHF"
      },
      capacity: {
        people: 4,
        dogs: 2,
        bedrooms: 2,
        rooms: 3,
        washrooms: 1
      },
      photos: [
        "https://example.com/mountain-cabin1.jpg",
        "https://example.com/mountain-cabin2.jpg",
        "https://example.com/mountain-cabin3.jpg"
      ],
      status: "active",
      totalRating: 4.5,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 4),
        dogFilters: getRandomFilters(filter.dogFilters, 3)
      }
    },
    {
      title: "Ski-in Apartment",
      description: "Modern apartment with direct access to ski slopes. Dog-friendly accommodation.",
      listingType: "Apartment",
      checkInTime: new Date("2023-06-15T14:00:00"),
      checkOutTime: new Date("2023-06-15T10:00:00"),
      location: {
        address: "Verbier, Switzerland",
        coordinates: [7.2285, 46.0964] // [longitude, latitude]
      },
      pricePerNight: {
        price: 220,
        currency: "CHF"
      },
      capacity: {
        people: 4,
        dogs: 1,
        bedrooms: 2,
        rooms: 3,
        washrooms: 1
      },
      photos: [
        "https://example.com/ski-apartment1.jpg",
        "https://example.com/ski-apartment2.jpg",
        "https://example.com/ski-apartment3.jpg"
      ],
      status: "active",
      totalRating: 4.3,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 3),
        dogFilters: getRandomFilters(filter.dogFilters, 2)
      }
    },
    {
      title: "Luxury Beach House",
      description: "High-end beach house with infinity pool. Large garden for dogs.",
      listingType: "House",
      checkInTime: new Date("2023-06-15T15:00:00"),
      checkOutTime: new Date("2023-06-15T11:00:00"),
      location: {
        address: "Mallorca, Spain",
        coordinates: [3.0176, 39.6953] // [longitude, latitude]
      },
      pricePerNight: {
        price: 380,
        currency: "CHF"
      },
      capacity: {
        people: 10,
        dogs: 3,
        bedrooms: 5,
        rooms: 7,
        washrooms: 4
      },
      photos: [
        "https://example.com/beach-house1.jpg",
        "https://example.com/beach-house2.jpg",
        "https://example.com/beach-house3.jpg"
      ],
      status: "active",
      totalRating: 4.8,
      source: {
        name: "interhome",
        redirectLink: "https://www.interhome.com/beachhouse"
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 5),
        dogFilters: getRandomFilters(filter.dogFilters, 4)
      }
    },
    {
      title: "Oceanfront Condo",
      description: "Modern condo with ocean views. Pet-friendly building with dog walking area.",
      listingType: "Apartment",
      checkInTime: new Date("2023-06-15T16:00:00"),
      checkOutTime: new Date("2023-06-15T10:00:00"),
      location: {
        address: "Ibiza, Spain",
        coordinates: [1.4821, 38.9067] // [longitude, latitude]
      },
      pricePerNight: {
        price: 290,
        currency: "CHF"
      },
      capacity: {
        people: 4,
        dogs: 1,
        bedrooms: 2,
        rooms: 3,
        washrooms: 2
      },
      photos: [
        "https://example.com/ocean-condo1.jpg",
        "https://example.com/ocean-condo2.jpg",
        "https://example.com/ocean-condo3.jpg"
      ],
      status: "active",
      totalRating: 4.4,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 4),
        dogFilters: getRandomFilters(filter.dogFilters, 3)
      }
    },
    {
      title: "Downtown Loft",
      description: "Stylish loft in city center. Close to dog parks and pet-friendly cafes.",
      listingType: "Apartment",
      checkInTime: new Date("2023-06-15T14:00:00"),
      checkOutTime: new Date("2023-06-15T11:00:00"),
      location: {
        address: "Zürich, Switzerland",
        coordinates: [8.5417, 47.3769] // [longitude, latitude]
      },
      pricePerNight: {
        price: 210,
        currency: "CHF"
      },
      capacity: {
        people: 2,
        dogs: 1,
        bedrooms: 1,
        rooms: 2,
        washrooms: 1
      },
      photos: [
        "https://example.com/downtown-loft1.jpg",
        "https://example.com/downtown-loft2.jpg",
        "https://example.com/downtown-loft3.jpg"
      ],
      status: "active",
      totalRating: 4.6,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 3),
        dogFilters: getRandomFilters(filter.dogFilters, 2)
      }
    },
    {
      title: "Modern Apartment",
      description: "Contemporary apartment with all amenities. Dog-friendly building.",
      listingType: "Apartment",
      checkInTime: new Date("2023-06-15T15:00:00"),
      checkOutTime: new Date("2023-06-15T10:00:00"),
      location: {
        address: "Geneva, Switzerland",
        coordinates: [6.1432, 46.2044] // [longitude, latitude]
      },
      pricePerNight: {
        price: 190,
        currency: "CHF"
      },
      capacity: {
        people: 3,
        dogs: 1,
        bedrooms: 1,
        rooms: 3,
        washrooms: 1
      },
      photos: [
        "https://example.com/modern-apt1.jpg",
        "https://example.com/modern-apt2.jpg",
        "https://example.com/modern-apt3.jpg"
      ],
      status: "active",
      totalRating: 4.2,
      source: {
        name: "interhome",
        redirectLink: "https://www.interhome.com/apartment"
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 4),
        dogFilters: getRandomFilters(filter.dogFilters, 2)
      }
    },
    {
      title: "Riverside Suite",
      description: "Elegant suite with river views. Pet-friendly with nearby walking trails.",
      listingType: "Apartment",
      checkInTime: new Date("2023-06-15T14:00:00"),
      checkOutTime: new Date("2023-06-15T11:00:00"),
      location: {
        address: "Basel, Switzerland",
        coordinates: [7.5886, 47.5596] // [longitude, latitude]
      },
      pricePerNight: {
        price: 170,
        currency: "CHF"
      },
      capacity: {
        people: 2,
        dogs: 1,
        bedrooms: 1,
        rooms: 2,
        washrooms: 1
      },
      photos: [
        "https://example.com/riverside-suite1.jpg",
        "https://example.com/riverside-suite2.jpg",
        "https://example.com/riverside-suite3.jpg"
      ],
      status: "active",
      totalRating: 4.5,
      source: {
        name: "waureisen",
        redirectLink: null
      },
      selectedFilters: {
        generalFilters: getRandomFilters(filter.generalFilters, 3),
        dogFilters: getRandomFilters(filter.dogFilters, 3)
      }
    }
  ];
  
  // Assign each listing to a random provider or distribute evenly
  const createdListings = [];
  
  for (let i = 0; i < listingData.length; i++) {
    const provider = providers[i % providers.length]; // Distribute evenly
    
    const listing = {
      ...listingData[i],
      owner: provider._id,
      ownerType: 'Provider'
    };
    
    const createdListing = await Listing.create(listing);
    createdListings.push(createdListing);
    
    // Update provider with listing reference
    await Provider.findByIdAndUpdate(
      provider._id,
      { $push: { listings: createdListing._id } }
    );
  }
  
  console.log(`${createdListings.length} listings created`);
  return createdListings;
};

// Create bookings and transactions
const createBookingsAndTransactions = async (users, listings) => {
  const bookings = [];
  const transactions = [];
  
  // Create bookings for each user with different listings
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userBookingCount = Math.floor(Math.random() * 3) + 1; // 1-3 bookings per user
    
    for (let j = 0; j < userBookingCount; j++) {
      // Pick a random listing
      const listing = listings[(i + j) % listings.length];
      
      // Create a booking
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 30) + 1);
      
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      const totalPrice = listing.pricePerNight.price * 
        Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      const booking = new Booking({
        user: user._id,
        listing: listing._id,
        type: 'booking',
        checkInDate,
        checkOutDate,
        totalPrice,
        status: ['pending', 'confirmed'][Math.floor(Math.random() * 2)]
      });
      
      const savedBooking = await booking.save();
      bookings.push(savedBooking);
      
      // Update user's bookings
      await User.findByIdAndUpdate(
        user._id,
        { 
          $push: { bookings: savedBooking._id },
          $inc: { totalBookings: 1 }
        }
      );
      
      // Create transaction for the booking
      const transaction = new Transaction({
        transactionId: `TRX-${new Date().getFullYear()}-${(Math.floor(Math.random() * 900) + 100)}`,
        user: user._id,
        amount: {
          chf: totalPrice,
          eur: totalPrice * 0.96 // Simple conversion
        },
        status: 'paid',
        date: new Date(),
        method: ['Credit Card', 'PayPal', 'Bank Transfer'][Math.floor(Math.random() * 3)],
        details: `Booking for ${listing.title}`
      });
      
      const savedTransaction = await transaction.save();
      transactions.push(savedTransaction);
    }
  }
  
  console.log(`${bookings.length} bookings created`);
  console.log(`${transactions.length} transactions created`);
};

// Main function to seed data
const seedData = async () => {
  try {
    await connectDB();
    await clearExistingData();
    
    const admins = await createAdmins();
    const users = await createUsers();
    const providers = await createProviders();
    const filters = await createFilters();
    const listings = await createListings(providers, filters);
    await createBookingsAndTransactions(users, listings);
    
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();