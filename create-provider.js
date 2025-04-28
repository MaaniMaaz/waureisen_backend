require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Provider = require('./models/provider.model');

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

// Create a new verified provider
const createVerifiedProvider = async () => {
  try {
    const targetEmail = 'i210815@nu.edu.pk';
    
    // Check if provider with this email already exists
    const existingProvider = await Provider.findOne({ email: targetEmail });
    
    if (existingProvider) {
      console.log(`Provider with email ${targetEmail} already exists. Deleting...`);
      await Provider.deleteOne({ email: targetEmail });
      console.log('Existing provider deleted successfully.');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);

    // Create provider data
    const newProvider = new Provider({
      username: 'nu_provider',
      email: targetEmail,
      password: hashedPassword,
      phoneNumber: '+92 300 1234567',
      profilePicture: 'https://randomuser.me/api/portraits/men/42.jpg',
      firstName: 'Hamza',
      lastName: 'Shahid',
      displayName: 'Hamza Shahid',
      bio: 'Experienced property host with a passion for hospitality. I specialize in luxury accommodations with a personal touch.',
      payoutDetails: {
        providerType: 'individual',
        country: 'Pakistan'
      },
      listings: [],
      messages: [],
      role: 'provider',
      profileStatus: 'verified', // Set to verified instead of default 'not verified'
      registrationStatus: 'complete',
      businessName: 'Hamza Luxury Accommodations',
      businessType: 'individual',
      vatNumber: 'VAT123456789',
      website: 'https://hamzaproperties.com',
      bankName: 'National Bank of Pakistan',
      accountHolder: 'Hamza Shahid',
      iban: 'PK36NBPA0123456789012345',
      swift: 'NBPAPKKA',
      stripeAccountId: 'acct_sample123456',
      hostingExperience: 'professional',
      propertyCount: '3',
      heardAboutUs: 'Through a friend'
    });

    // Save the provider to the database
    const savedProvider = await newProvider.save();
    
    console.log('Verified provider created successfully!');
    console.log('Provider ID:', savedProvider._id);
    console.log('Email:', targetEmail);
    console.log('Password: test123');
    console.log('Profile Status: verified');
    
  } catch (error) {
    console.error('Error creating provider:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
(async () => {
  await connectDB();
  await createVerifiedProvider();
})();