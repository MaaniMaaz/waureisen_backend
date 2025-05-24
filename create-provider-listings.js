// require('dotenv').config();
// const mongoose = require('mongoose');
// const Provider = require('./models/provider.model');
// const Listing = require('./models/listing.model');
// const listingNotificationService = require('./services/listingNotification.service');

// // Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('MongoDB connected successfully');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// // Helper function to generate a unique code
// const generateUniqueCode = () => {
//   // Format: WR-followed by timestamp and random 3 digits
//   const timestamp = Date.now().toString().slice(-6);
//   const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//   return `WR-${timestamp}-${random}`;
// };

// // Create a listing for a specific provider
// const createSingleListing = async () => {
//   try {
//     const providerEmail = 'hallo@waureisen.com';
    
//     // Find the provider
//     const provider = await Provider.findOne({ email: providerEmail });
    
//     if (!provider) {
//       console.error(`Provider with email ${providerEmail} not found!`);
//       return;
//     }
    
//     console.log(`Found provider: ${provider.firstName || 'Unknown'} ${provider.lastName || 'Unknown'} (ID: ${provider._id})`);
    
//     // Generate a unique code for the listing
//     const uniqueCode = generateUniqueCode();
//     console.log(`Generated unique code for listing: ${uniqueCode}`);
    
//     // Create listing data
//     const listingData = {
//       // Add the unique Code field
//       Code: uniqueCode,
      
//       title: "Luxury Alpine Hideaway with Private Hot Tub",
//       listingType: "Chalet",
//       description: {
//         general: "Experience the magic of the Swiss Alps in this luxurious wooden chalet with private hot tub and stunning views.",
//         inside: "Beautifully crafted interior with exposed wooden beams, stone fireplace, gourmet kitchen, and premium furnishings throughout.",
//         outside: "Private deck with hot tub, panoramic mountain views, garden area, and covered parking."
//       },
//       checkInTime: new Date('2023-01-01T15:00:00Z'),
//       checkOutTime: new Date('2023-01-01T11:00:00Z'),
//       location: {
//         address: '45 Mountain Pass Road, Verbier, Switzerland',
//         optional: 'Alpine Hideaway',
//         type: 'Point',
//         coordinates: [7.2278, 46.0992] // Verbier coordinates
//       },
//       pricePerNight: {
//         price: 380,
//         currency: 'CHF'
//       },
//       specialPrices: [
//         {
//           pricePerNight: {
//             price: 520,
//             currency: 'CHF'
//           },
//           startDate: new Date('2023-12-15'),
//           endDate: new Date('2024-03-15')
//         }
//       ],
//       additionalServices: [
//         {
//           serviceTitle: 'Hot Tub Maintenance',
//           priceofService: {
//             price: 50,
//             currency: 'CHF'
//           },
//           chargesAccordingTo: 'Per stay',
//           type: 'Mandatory'
//         },
//         {
//           serviceTitle: 'Ski Equipment Rental',
//           priceofService: {
//             price: 200,
//             currency: 'CHF'
//           },
//           chargesAccordingTo: 'Per stay',
//           type: 'Optional'
//         }
//       ],
//       availability: [
//         {
//           timeZone: 'Europe/Zurich',
//           weeklyDefaultSchedule: [
//             { day: 'Monday' },
//             { day: 'Tuesday' },
//             { day: 'Wednesday' },
//             { day: 'Thursday' },
//             { day: 'Friday' },
//             { day: 'Saturday' },
//             { day: 'Sunday' }
//           ]
//         }
//       ],
//       maxDogs: 2,
//       bedRooms: 3,
//       beds: 5,
//       rooms: {
//         number: 6,
//         room: [
//           { floor: 'Ground', type: 'Living Room', count: 1 },
//           { floor: 'Ground', type: 'Kitchen', count: 1 },
//           { floor: 'Ground', type: 'Dining Room', count: 1 },
//           { floor: '1st', type: 'Master Bedroom', count: 1 },
//           { floor: '1st', type: 'Bedroom', count: 2 }
//         ]
//       },
//       washrooms: 2,
//       status: 'active',
//       attributes: [
//         { name: 'Hot Tub', description: ['Private outdoor hot tub'] },
//         { name: 'Ski Access', description: ['10-minute drive to ski lifts'] },
//         { name: 'Mountain Views', description: ['Panoramic Alpine views'] }
//       ],
//       legal: {
//         cancellationPolicy: 'Free cancellation up to 30 days before check-in. 50% refund up to 14 days before check-in. No refund after that.',
//         termsAndConditions: 'No ski boots inside. Hot tub rules must be followed. Quiet hours from 10 PM to 7 AM.'
//       },
//       countryCode: 'CH',
//       country: {
//         language: 'French',
//         content: 'Switzerland'
//       },
//       source: {
//         name: 'waureisen',
//         redirectLink: null
//       },
//       images: [
//         'https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d',
//         'https://images.unsplash.com/photo-1559732277-7453b141e3a1',
//         'https://images.unsplash.com/photo-1530062845289-9109b2c9c868'
//       ],
//       selectedFilters: {
//         generalFilters: [{ name: 'Mountain view', icon: 'mountain' }],
//         mainFilters: [{ name: 'Wi-Fi', icon: 'wifi' }],
//         wellnessFilters: [{ name: 'Hot tub', icon: 'hot-tub' }],
//         dogFilters: [{ name: 'Dog friendly', icon: 'paw' }]
//       },
//       owner: provider._id,
//       ownerType: 'Provider'
//     };
    
//     // Create the listing
//     const newListing = new Listing(listingData);
//     const savedListing = await newListing.save();
    
//     // Add to provider's listings array
//     provider.listings.push(savedListing._id);
//     await provider.save();
    
//     console.log(`Created listing: ${savedListing.title} (ID: ${savedListing._id})`);
//     console.log('\nListing details:', {
//       code: savedListing.Code,
//       title: savedListing.title,
//       location: savedListing.location.address,
//       price: `${savedListing.pricePerNight.price} ${savedListing.pricePerNight.currency}`,
//       status: savedListing.status
//     });
    
//     // Send email notification
//     console.log('Sending email notification...');
//     try {
//       const result = await listingNotificationService.sendListingCreationEmail(savedListing);
//       console.log('Email notification sent successfully:', result);
//     } catch (emailError) {
//       console.error('Error sending email notification:', emailError);
//     }
    
//     return savedListing;
    
//   } catch (error) {
//     console.error('Error creating listing:', error);
//     throw error;
//   } finally {
//     // Close the database connection
//     mongoose.connection.close();
//     console.log('Database connection closed');
//   }
// };

// // Run the script
// (async () => {
//   await connectDB();
//   await createSingleListing();
// })();