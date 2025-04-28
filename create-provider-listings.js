require('dotenv').config();
const mongoose = require('mongoose');
const Provider = require('./models/provider.model');
const Listing = require('./models/listing.model');

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

// Create listings for a specific provider
const createListingsForProvider = async () => {
  try {
    const providerEmail = 'i210815@nu.edu.pk';
    
    // Find the provider
    const provider = await Provider.findOne({ email: providerEmail });
    
    if (!provider) {
      console.error(`Provider with email ${providerEmail} not found!`);
      return;
    }
    
    console.log(`Found provider: ${provider.firstName} ${provider.lastName} (ID: ${provider._id})`);
    
    // Delete any existing listings for this provider
    const existingListings = await Listing.find({ owner: provider._id });
    if (existingListings.length > 0) {
      console.log(`Deleting ${existingListings.length} existing listings for this provider...`);
      await Listing.deleteMany({ owner: provider._id });
    }
    
    // Generate 5 different listings
    const listingsData = [
      {
        Code: 'WR-LUX-001',
        listingType: 'Apartment',
        title: 'Luxury Apartment with Mountain View',
        description: {
          general: 'Stunning luxury apartment with breathtaking mountain views, perfect for a relaxing getaway.',
          inside: 'Modern furnishings, fully equipped kitchen, spacious living area, and comfortable bedrooms.',
          outside: 'Private balcony with panoramic mountain views, shared garden, and parking space.'
        },
        checkInTime: new Date('2023-01-01T14:00:00Z'),
        checkOutTime: new Date('2023-01-01T11:00:00Z'),
        location: {
          address: 'Alpine Heights, 123 Mountain Road, Zurich, Switzerland',
          optional: 'Building A, Apartment 5',
          type: 'Point',
          coordinates: [8.5417, 47.3769] // Zurich coordinates
        },
        pricePerNight: {
          price: 250,
          currency: 'CHF'
        },
        specialPrices: [
          {
            pricePerNight: {
              price: 300,
              currency: 'CHF'
            },
            startDate: new Date('2023-12-20'),
            endDate: new Date('2024-01-05')
          }
        ],
        additionalServices: [
          {
            serviceTitle: 'Breakfast',
            priceofService: {
              price: 25,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per night',
            type: 'Optional'
          },
          {
            serviceTitle: 'Cleaning',
            priceofService: {
              price: 80,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per stay',
            type: 'Mandatory'
          }
        ],
        availability: [
          {
            timeZone: 'Europe/Zurich',
            weeklyDefaultSchedule: [
              { day: 'Monday' },
              { day: 'Tuesday' },
              { day: 'Wednesday' },
              { day: 'Thursday' },
              { day: 'Friday' },
              { day: 'Saturday' },
              { day: 'Sunday' }
            ]
          }
        ],
        maxDogs: 2,
        bedRooms: 2,
        beds: 3,
        rooms: {
          number: 4,
          room: [
            { floor: '1st', type: 'Bedroom', count: 2 },
            { floor: '1st', type: 'Living Room', count: 1 },
            { floor: '1st', type: 'Kitchen', count: 1 }
          ]
        },
        washrooms: 2,
        status: 'active',
        attributes: [
          { name: 'Mountain View', description: ['Panoramic views of the Swiss Alps'] },
          { name: 'Dog Friendly', description: ['Up to 2 dogs allowed', 'Dog beds provided'] }
        ],
        legal: {
          cancellationPolicy: 'Free cancellation up to 7 days before check-in. 50% refund up to 3 days before check-in. No refund after that.',
          termsAndConditions: 'No parties or events. Quiet hours from 10 PM to 7 AM.'
        },
        countryCode: 'CH',
        country: {
          language: 'German',
          content: 'Switzerland'
        },
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
        ],
        selectedFilters: {
          generalFilters: [{ name: 'Mountain view', icon: 'mountain' }],
          mainFilters: [{ name: 'Wi-Fi', icon: 'wifi' }],
          accomodationFilters: [{ name: 'Balcony', icon: 'door-open' }],
          kitchenFilters: [{ name: 'Dishwasher', icon: 'droplet' }],
          dogFilters: [{ name: 'Dog friendly', icon: 'paw' }]
        }
      },
      
      {
        Code: 'WR-LUX-002',
        listingType: 'Chalet',
        title: 'Cozy Alpine Chalet with Private Hot Tub',
        description: {
          general: 'Charming wooden chalet in the heart of the Swiss Alps with private hot tub and stunning views.',
          inside: 'Traditional Swiss design with modern amenities, wood-burning fireplace, and open-plan living area.',
          outside: 'Private hot tub, garden, terrace with mountain views, and parking for two cars.'
        },
        checkInTime: new Date('2023-01-01T15:00:00Z'),
        checkOutTime: new Date('2023-01-01T10:00:00Z'),
        location: {
          address: '45 Forest Lane, Zermatt, Switzerland',
          optional: 'Chalet 7',
          type: 'Point',
          coordinates: [7.7474, 46.0207] // Zermatt coordinates
        },
        pricePerNight: {
          price: 350,
          currency: 'CHF'
        },
        specialPrices: [
          {
            pricePerNight: {
              price: 450,
              currency: 'CHF'
            },
            startDate: new Date('2023-12-15'),
            endDate: new Date('2024-01-10')
          }
        ],
        additionalServices: [
          {
            serviceTitle: 'Firewood',
            priceofService: {
              price: 15,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per night',
            type: 'Optional'
          },
          {
            serviceTitle: 'Final Cleaning',
            priceofService: {
              price: 120,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per stay',
            type: 'Mandatory'
          }
        ],
        availability: [
          {
            timeZone: 'Europe/Zurich',
            weeklyDefaultSchedule: [
              { day: 'Monday' },
              { day: 'Tuesday' },
              { day: 'Wednesday' },
              { day: 'Thursday' },
              { day: 'Friday' },
              { day: 'Saturday' },
              { day: 'Sunday' }
            ]
          }
        ],
        maxDogs: 3,
        bedRooms: 3,
        beds: 5,
        rooms: {
          number: 6,
          room: [
            { floor: 'Ground', type: 'Living Room', count: 1 },
            { floor: 'Ground', type: 'Kitchen', count: 1 },
            { floor: 'Ground', type: 'Dining Room', count: 1 },
            { floor: '1st', type: 'Bedroom', count: 2 },
            { floor: '2nd', type: 'Bedroom', count: 1 }
          ]
        },
        washrooms: 2,
        status: 'active',
        attributes: [
          { name: 'Hot Tub', description: ['Private outdoor hot tub'] },
          { name: 'Fireplace', description: ['Traditional wood-burning fireplace'] },
          { name: 'Ski Storage', description: ['Dedicated ski and boot storage room'] }
        ],
        legal: {
          cancellationPolicy: 'Free cancellation up to 30 days before check-in. 50% refund up to 14 days before check-in. No refund after that.',
          termsAndConditions: 'No smoking inside. Quiet hours from 10 PM to 7 AM. No more than 8 guests at any time.'
        },
        countryCode: 'CH',
        country: {
          language: 'German',
          content: 'Switzerland'
        },
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
          'https://images.unsplash.com/photo-1542718610-a1d656d1884c',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739'
        ],
        selectedFilters: {
          generalFilters: [{ name: 'Mountain view', icon: 'mountain' }],
          mainFilters: [{ name: 'Wi-Fi', icon: 'wifi' }],
          wellnessFilters: [{ name: 'Hot tub', icon: 'droplet' }],
          kitchenFilters: [{ name: 'Full kitchen', icon: 'utensils' }],
          dogFilters: [{ name: 'Dog friendly', icon: 'paw' }]
        }
      },
      
      {
        Code: 'WR-LUX-003',
        listingType: 'Villa',
        title: 'Luxurious Lakeside Villa with Private Dock',
        description: {
          general: 'Elegant villa on the shores of Lake Geneva with private dock, garden, and breathtaking views.',
          inside: 'Sophisticated interior with high-end furnishings, gourmet kitchen, and floor-to-ceiling windows overlooking the lake.',
          outside: 'Landscaped garden, private dock, outdoor dining area, and infinity pool.'
        },
        checkInTime: new Date('2023-01-01T16:00:00Z'),
        checkOutTime: new Date('2023-01-01T10:00:00Z'),
        location: {
          address: '78 Lakeside Avenue, Montreux, Switzerland',
          optional: 'Villa Serenity',
          type: 'Point',
          coordinates: [6.9147, 46.4312] // Montreux coordinates
        },
        pricePerNight: {
          price: 800,
          currency: 'CHF'
        },
        specialPrices: [
          {
            pricePerNight: {
              price: 1200,
              currency: 'CHF'
            },
            startDate: new Date('2023-07-01'),
            endDate: new Date('2023-08-31')
          }
        ],
        additionalServices: [
          {
            serviceTitle: 'Private Chef',
            priceofService: {
              price: 350,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per night',
            type: 'Optional'
          },
          {
            serviceTitle: 'Boat Rental',
            priceofService: {
              price: 200,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per night',
            type: 'Optional'
          }
        ],
        availability: [
          {
            timeZone: 'Europe/Zurich',
            weeklyDefaultSchedule: [
              { day: 'Monday' },
              { day: 'Tuesday' },
              { day: 'Wednesday' },
              { day: 'Thursday' },
              { day: 'Friday' },
              { day: 'Saturday' },
              { day: 'Sunday' }
            ]
          }
        ],
        maxDogs: 2,
        bedRooms: 5,
        beds: 7,
        rooms: {
          number: 9,
          room: [
            { floor: 'Ground', type: 'Living Room', count: 1 },
            { floor: 'Ground', type: 'Dining Room', count: 1 },
            { floor: 'Ground', type: 'Kitchen', count: 1 },
            { floor: 'Ground', type: 'Study', count: 1 },
            { floor: '1st', type: 'Bedroom', count: 3 },
            { floor: '2nd', type: 'Bedroom', count: 2 }
          ]
        },
        washrooms: 5,
        status: 'active',
        attributes: [
          { name: 'Lake View', description: ['Panoramic views of Lake Geneva'] },
          { name: 'Private Dock', description: ['Direct access to the lake with private dock'] },
          { name: 'Infinity Pool', description: ['Heated infinity pool overlooking the lake'] }
        ],
        legal: {
          cancellationPolicy: 'Free cancellation up to 60 days before check-in. 70% refund up to 30 days before check-in. No refund after that.',
          termsAndConditions: 'No parties or events without prior approval. Security deposit required. No smoking inside.'
        },
        countryCode: 'CH',
        country: {
          language: 'French',
          content: 'Switzerland'
        },
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
          'https://images.unsplash.com/photo-1600607687644-aac4adf654e6'
        ],
        selectedFilters: {
          generalFilters: [{ name: 'Lake view', icon: 'water' }],
          mainFilters: [{ name: 'Wi-Fi', icon: 'wifi' }],
          poolFilters: [{ name: 'Private pool', icon: 'swimming-pool' }],
          dogFilters: [{ name: 'Dog friendly', icon: 'paw' }],
          waterFilters: [{ name: 'Lake access', icon: 'boat' }]
        }
      },
      
      {
        Code: 'WR-LUX-004',
        listingType: 'Cabin',
        title: 'Rustic Forest Cabin with Sauna',
        description: {
          general: 'Secluded wooden cabin nestled in the dense Swiss forest, featuring a private sauna and hiking trails.',
          inside: 'Rustic interior with wooden beams, cozy fireplace, comfortable furnishings, and modern amenities.',
          outside: 'Private sauna cabin, forest garden, fire pit, and direct access to hiking trails.'
        },
        checkInTime: new Date('2023-01-01T15:00:00Z'),
        checkOutTime: new Date('2023-01-01T11:00:00Z'),
        location: {
          address: '12 Forest Path, Interlaken, Switzerland',
          optional: 'Cabin Pine',
          type: 'Point',
          coordinates: [7.8632, 46.6863] // Interlaken coordinates
        },
        pricePerNight: {
          price: 220,
          currency: 'CHF'
        },
        specialPrices: [
          {
            pricePerNight: {
              price: 280,
              currency: 'CHF'
            },
            startDate: new Date('2023-09-01'),
            endDate: new Date('2023-10-31')
          }
        ],
        additionalServices: [
          {
            serviceTitle: 'Firewood',
            priceofService: {
              price: 10,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per night',
            type: 'Optional'
          },
          {
            serviceTitle: 'Hiking Guide',
            priceofService: {
              price: 150,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per stay',
            type: 'Optional'
          }
        ],
        availability: [
          {
            timeZone: 'Europe/Zurich',
            weeklyDefaultSchedule: [
              { day: 'Monday' },
              { day: 'Tuesday' },
              { day: 'Wednesday' },
              { day: 'Thursday' },
              { day: 'Friday' },
              { day: 'Saturday' },
              { day: 'Sunday' }
            ]
          }
        ],
        maxDogs: 3,
        bedRooms: 2,
        beds: 3,
        rooms: {
          number: 4,
          room: [
            { floor: 'Ground', type: 'Living Room', count: 1 },
            { floor: 'Ground', type: 'Kitchen', count: 1 },
            { floor: 'Loft', type: 'Bedroom', count: 2 }
          ]
        },
        washrooms: 1,
        status: 'active',
        attributes: [
          { name: 'Sauna', description: ['Private outdoor sauna cabin'] },
          { name: 'Fireplace', description: ['Wood-burning fireplace'] },
          { name: 'Hiking', description: ['Direct access to forest trails'] }
        ],
        legal: {
          cancellationPolicy: 'Free cancellation up to 14 days before check-in. 50% refund up to 7 days before check-in. No refund after that.',
          termsAndConditions: 'No parties. Respect nature and wildlife. Follow forest fire safety rules.'
        },
        countryCode: 'CH',
        country: {
          language: 'German',
          content: 'Switzerland'
        },
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        images: [
          'https://images.unsplash.com/photo-1543320485-d0d5a49c2b2e',
          'https://images.unsplash.com/photo-1464146072366-987642d0b5e8',
          'https://images.unsplash.com/photo-1542718610-a1d656d1884c'
        ],
        selectedFilters: {
          generalFilters: [{ name: 'Forest view', icon: 'tree' }],
          mainFilters: [{ name: 'Wi-Fi', icon: 'wifi' }],
          wellnessFilters: [{ name: 'Sauna', icon: 'hot-tub' }],
          dogFilters: [{ name: 'Dog friendly', icon: 'paw' }],
          sportFilters: [{ name: 'Hiking access', icon: 'hiking' }]
        }
      },
      
      {
        Code: 'WR-LUX-005',
        listingType: 'Penthouse',
        title: 'Modern City Penthouse with Rooftop Terrace',
        description: {
          general: 'Ultra-modern penthouse in the heart of Geneva with private rooftop terrace and panoramic city views.',
          inside: 'Sleek contemporary design, floor-to-ceiling windows, high-end appliances, and luxury furnishings.',
          outside: 'Expansive rooftop terrace with lounge area, dining space, and city views.'
        },
        checkInTime: new Date('2023-01-01T14:00:00Z'),
        checkOutTime: new Date('2023-01-01T12:00:00Z'),
        location: {
          address: '88 Central Boulevard, Geneva, Switzerland',
          optional: 'Penthouse 12A',
          type: 'Point',
          coordinates: [6.1432, 46.2044] // Geneva coordinates
        },
        pricePerNight: {
          price: 450,
          currency: 'CHF'
        },
        specialPrices: [
          {
            pricePerNight: {
              price: 550,
              currency: 'CHF'
            },
            startDate: new Date('2023-06-01'),
            endDate: new Date('2023-08-31')
          }
        ],
        additionalServices: [
          {
            serviceTitle: 'Airport Transfer',
            priceofService: {
              price: 120,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per stay',
            type: 'Optional'
          },
          {
            serviceTitle: 'Concierge Service',
            priceofService: {
              price: 50,
              currency: 'CHF'
            },
            chargesAccordingTo: 'Per night',
            type: 'Optional'
          }
        ],
        availability: [
          {
            timeZone: 'Europe/Zurich',
            weeklyDefaultSchedule: [
              { day: 'Monday' },
              { day: 'Tuesday' },
              { day: 'Wednesday' },
              { day: 'Thursday' },
              { day: 'Friday' },
              { day: 'Saturday' },
              { day: 'Sunday' }
            ]
          }
        ],
        maxDogs: 1,
        bedRooms: 3,
        beds: 4,
        rooms: {
          number: 6,
          room: [
            { floor: 'Penthouse', type: 'Living Room', count: 1 },
            { floor: 'Penthouse', type: 'Dining Room', count: 1 },
            { floor: 'Penthouse', type: 'Kitchen', count: 1 },
            { floor: 'Penthouse', type: 'Bedroom', count: 3 }
          ]
        },
        washrooms: 3,
        status: 'active',
        attributes: [
          { name: 'City View', description: ['Panoramic views of Geneva and the lake'] },
          { name: 'Rooftop Terrace', description: ['Private rooftop terrace with lounge and dining areas'] },
          { name: 'Smart Home', description: ['Smart home features throughout'] }
        ],
        legal: {
          cancellationPolicy: 'Free cancellation up to 30 days before check-in. 50% refund up to 14 days before check-in. No refund after that.',
          termsAndConditions: 'No parties or events. Respect the neighbors. No smoking inside or on the terrace.'
        },
        countryCode: 'CH',
        country: {
          language: 'French',
          content: 'Switzerland'
        },
        source: {
          name: 'waureisen',
          redirectLink: null
        },
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0'
        ],
        selectedFilters: {
          generalFilters: [{ name: 'City view', icon: 'building' }],
          mainFilters: [{ name: 'Wi-Fi', icon: 'wifi' }],
          accomodationFilters: [{ name: 'Terrace', icon: 'door-open' }],
          dogFilters: [{ name: 'Dog friendly', icon: 'paw' }],
          parkingFilters: [{ name: 'Garage parking', icon: 'car' }]
        }
      }
    ];
    
    // Create the listings and update the provider
    const createdListings = [];
    
    for (const listingData of listingsData) {
      // Add owner information
      const completeListingData = {
        ...listingData,
        owner: provider._id,
        ownerType: 'Provider'
      };
      
      // Create the listing
      const newListing = new Listing(completeListingData);
      const savedListing = await newListing.save();
      createdListings.push(savedListing);
      
      console.log(`Created listing: ${savedListing.title} (ID: ${savedListing._id})`);
    }
    
    // Update provider with the new listings
    provider.listings = createdListings.map(listing => listing._id);
    await provider.save();
    
    console.log(`\nSuccessfully created ${createdListings.length} listings for provider ${provider.firstName} ${provider.lastName}`);
    console.log('Listings:', createdListings.map(listing => listing.title).join(', '));
    
  } catch (error) {
    console.error('Error creating listings:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
(async () => {
  await connectDB();
  await createListingsForProvider();
})();