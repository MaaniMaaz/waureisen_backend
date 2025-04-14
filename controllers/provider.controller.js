const providerService = require('../services/provider.service');
const listingService = require('../services/listing.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Add these new methods at the beginning of the file
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, phoneNumber, firstName, lastName } = req.body;

        // Check if provider already exists
        const existingProvider = await providerService.getProviderByEmail(email);
        if (existingProvider) {
            return res.status(400).json({ message: 'Provider already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create provider
        const newProvider = await providerService.createProvider({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            firstName,
            lastName,
            profileStatus: 'not verified'
        });

        // Generate token
        const token = jwt.sign(
            { id: newProvider._id, role: 'provider' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Provider created successfully',
            token,
            provider: {
                id: newProvider._id,
                username: newProvider.username,
                email: newProvider.email
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find provider
        const provider = await providerService.getProviderByEmail(email);
        if (!provider) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, provider.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if provider is banned
        if (provider.profileStatus === 'banned') {
            return res.status(403).json({ message: 'Account is banned' });
        }

        // Generate token
        const token = jwt.sign(
            { id: provider._id, role: 'provider' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            provider: {
                id: provider._id,
                username: provider.username,
                email: provider.email,
                profileStatus: provider.profileStatus
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllProviders = async (req, res, next) => {
  try {
    const providers = await providerService.getAllProviders();
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderById(req.params.id);
    res.json(provider);
  } catch (err) {
    next(err);
  }
};

exports.createProvider = async (req, res, next) => {
  try {
    const newProvider = await providerService.createProvider(req.body);
    res.status(201).json(newProvider);
  } catch (err) {
    next(err);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const updatedProvider = await providerService.updateProvider(req.params.id, req.body);
    res.json(updatedProvider);
  } catch (err) {
    next(err);
  }
};

exports.updateProviderStatus = async (req, res, next) => {
  try {
    const status = req.headers['profile-status']?.toLowerCase() || 'banned';
    if (!['not verified', 'pending verification', 'verified', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedProvider = await providerService.updateProvider(req.params.id, { profileStatus: status });
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json({ message: `Provider status updated to ${status}`, provider: updatedProvider });
  } catch (err) {
    next(err);
  }
};

exports.deleteProvider = async (req, res, next) => {
  try {
    await providerService.deleteProvider(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.addListing = async (req, res, next) => {
  try {
    const providerId = req.user.id; // Get provider ID from JWT token
    const listingData = req.body;

    // Verify if the provider exists
    const provider = await providerService.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Add owner reference to listing data
    listingData.owner = providerId;
    listingData.ownerType = 'Provider';
    
    // Create new listing using listing service
    const newListing = await listingService.createListing(listingData);

    // Add listing reference to provider's listings array
    provider.listings.push(newListing._id);
    await provider.save();

    // Return the populated listing data
    const populatedListing = await listingService.getListingById(newListing._id);
    
    res.status(201).json(populatedListing);
  } catch (err) {
    next(err);
  }
};


exports.getProviderAnalytics = async (req, res, next) => {
  try {
    const timeRange = req.query.timeRange || 'month';
    const providerId = req.user.id;
    
    // Get provider's listings
    const provider = await providerService.getProviderById(providerId);
    const listingIds = provider.listings.map(listing => listing._id);
    
    // Define date ranges based on timeRange
    const currentDate = new Date();
    let startDate;
    
    switch(timeRange) {
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
    }
    
    // Get bookings for date range
    // Assuming there's a method to get bookings by date range in booking service
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: startDate, $lte: currentDate }
    }).sort({ createdAt: 1 });
    
    // Process revenue data
    const revenueData = processTimeSeriesData(bookings, timeRange, 'revenue');
    
    // Process booking count data  
    const bookingData = processTimeSeriesData(bookings, timeRange, 'bookings');
    
    res.json({
      revenue: revenueData,
      bookings: bookingData
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to process time series data
function processTimeSeriesData(bookings, timeRange, dataType) {
  // Different date formats based on time range
  let dateFormat;
  let groupByFormat;
  
  switch(timeRange) {
    case 'week':
      dateFormat = { day: 'numeric', month: 'short' };
      groupByFormat = 'MMM-DD';
      break;
    case 'month':
      dateFormat = { day: 'numeric', month: 'short' };
      groupByFormat = 'MMM-DD';  
      break;
    case 'year':
      dateFormat = { month: 'short', year: 'numeric' };
      groupByFormat = 'MMM-YYYY';
      break;
    default:
      dateFormat = { day: 'numeric', month: 'short' };
      groupByFormat = 'MMM-DD';
  }
  
  // Group data by date
  const groupedData = {};
  
  bookings.forEach(booking => {
    const date = new Date(booking.createdAt);
    const dateKey = date.toLocaleDateString('en-US', dateFormat);
    
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = { 
        date: dateKey,
        revenue: 0,
        bookings: 0
      };
    }
    
    groupedData[dateKey].bookings += 1;
    groupedData[dateKey].revenue += booking.totalPrice || 0;
  });
  
  // Convert to array and sort by date
  const result = Object.values(groupedData);
  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return result;
}