const providerService = require('../services/provider.service');
const listingService = require('../services/listing.service');

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
