const mongoose = require("mongoose");
const providerService = require("../services/provider.service");
const listingService = require("../services/listing.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Listing = require("../models/listing.model");
const Booking = require("../models/booking.model");
const Transaction = require("../models/transaction.model");
const Review = require("../models/review.model");
const Provider = require("../models/provider.model");
const { sendPasswordResetToken } = require("../services/email.service");

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, phoneNumber, firstName, lastName } =
      req.body;

    // Check if provider already exists
    const existingProvider = await providerService.getProviderByEmail(email);
    if (existingProvider) {
      return res.status(400).json({ message: "Provider already exists" });
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
      profileStatus: "not verified",
    });

    // Generate token
    const token = jwt.sign(
      { id: newProvider._id, role: "provider" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Provider created successfully",
      token,
      provider: {
        id: newProvider._id,
        username: newProvider.username,
        email: newProvider.email,
         profileCompleted: newProvider.profileCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res) => {
  
  try {
    const { email } = req.body;
    const provider = await Provider.findOne({ email });
    if (!provider) {
       return res.status(400).json({ message: "provider not exist" });
   
    }
    const passwordResetToken = Math.floor(100000 + Math.random() * 900000);
    const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    provider.passwordResetToken = passwordResetToken;
    provider.passwordResetTokenExpires = passwordResetTokenExpires;
    // console.log(passwordResetToken);
    await provider.save();
    await sendPasswordResetToken(email , passwordResetToken ,"provider")
    
     return res.status(200).json({ message: `Password reset token sent to ${email}` });
   
  } catch (error) {
    console.log(error);
    
     return res.status(500).json({ message: "Something went wrong" });
   
  }
};

exports.resetPassword = async (req, res) => {
  
  try {
    const { email, passwordResetToken, password } = req.body;
    const user = await Provider.findOne({ email }).select("+password");
    if (!user) {
       return res.status(404).json({ message: "User does not exist" });

    }
    if (
      user.passwordResetToken.toString() !== passwordResetToken.toString() ||
      user.passwordResetTokenExpires < Date.now()
    ) {
       return res.status(400).json({ message: "Invalid token" });
   
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();
     return res.status(200).json({ message: "Password reset successfully" });
   
  } catch (error) {
     return res.status(500).json({ message: "Something went wrong" });
   
  }
};
// Add this new endpoint after the existing signup function in provider.controller.js

exports.completeRegistration = async (req, res, next) => {
  try {
    const providerId = req.user.id; // Get provider ID from auth token
    const registrationData = req.body;

    // Find the provider to ensure they exist and are in incomplete registration state
    const provider = await providerService.getProviderById(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Complete the registration with all the data
    const updatedProvider = await providerService.completeProviderRegistration(
      providerId,
      registrationData
    );

    // Return success response with updated provider data
    res.status(200).json({
      message: "Provider registration completed successfully",
      provider: {
        ...registrationData,
        id: updatedProvider._id,
        username: updatedProvider.username,
        email: updatedProvider.email,
        profileStatus: updatedProvider.profileStatus,
        registrationStatus: updatedProvider.registrationStatus,
         profileCompleted: provider.profileCompleted,
      },
    });
  } catch (err) {
    console.error("Error completing provider registration:", err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const provider = await providerService.getProviderByEmail(email);
    if (!provider) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, provider.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if provider is banned
    if (provider.profileStatus === "banned") {
      return res.status(403).json({
        message:
          "Your account has been banned. Please contact support for assistance.",
        isBanned: true,
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: provider._id, role: "provider" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      provider: {
        id: provider._id,
        username: provider.username,
        email: provider.email,
        profileStatus: provider.profileStatus,
        profileCompleted: provider.profileCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllProviders = async (req, res, next) => {
  try {
    const providers = await mongoose.model("Provider").find();
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    const provider = await providerService.getProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

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
    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    const updatedProvider = await providerService.updateProvider(
      req.params.id,
      req.body
    );
    if (!updatedProvider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(updatedProvider);
  } catch (err) {
    next(err);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    // const listing = await listingService.getListingById(req.params.id);
    // if (!listing || listing.owner.toString() !== req.user.id) {
    //   return res
    //     .status(404)
    //     .json({ message: "Listing not found or not owned by provider" });
    // }
    const updatedListing = await listingService.updateListing(
      req.params.id,
      req.body
    );
    res.json(updatedListing);
  } catch (err) {
    next(err);
  }
};

exports.updateProviderStatus = async (req, res, next) => {
  try {
    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    // Get status from header
    const status = req.headers["profile-status"]?.toLowerCase() || "banned";
    console.log(
      "Updating provider status to:",
      status,
      "for provider ID:",
      req.params.id
    );

    if (
      !["not verified", "pending verification", "verified", "banned"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedProvider = await providerService.updateProvider(
      req.params.id,
      { profileStatus: status }
    );

    if (!updatedProvider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // If the provider is being banned, update all their listings to inactive
    if (status === "banned") {
      try {
        // Find all listings owned by this provider
        const listings = await Listing.find({
          owner: req.params.id,
          ownerType: "Provider",
        });

        console.log(
          `Found ${listings.length} listings to disable for provider ${req.params.id}`
        );

        // Update all listings to inactive
        if (listings.length > 0) {
          await Promise.all(
            listings.map((listing) =>
              Listing.findByIdAndUpdate(listing._id, { status: "inactive" })
            )
          );

          console.log(
            `Disabled ${listings.length} listings for banned provider ${req.params.id}`
          );
        }
      } catch (listingError) {
        console.error("Error disabling provider listings:", listingError);
        // Continue with the ban even if disabling listings fails
      }
    }

    res.json({
      message: `Provider status updated to ${status}`,
      provider: updatedProvider,
    });
  } catch (err) {
    console.error("Error in updateProviderStatus:", err);
    next(err);
  }
};


exports.deleteProvider = async (req, res, next) => {
  try {
    const providerId = req.params.id;
    
    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ 
        message: "Invalid provider ID format",
        error: "INVALID_ID_FORMAT"
      });
    }

    console.log(`Attempting to delete provider: ${providerId}`);

    // Check if provider exists first
    const provider = await providerService.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ 
        message: "Provider not found",
        error: "PROVIDER_NOT_FOUND"
      });
    }

    // Perform the deletion
    const deleted = await providerService.deleteProvider(providerId);
    
    if (!deleted) {
      return res.status(500).json({ 
        message: "Failed to delete provider",
        error: "DELETION_FAILED"
      });
    }

    console.log(`Successfully deleted provider: ${providerId}`);
    
    // Send success response
    res.status(200).json({ 
      message: "Provider deleted successfully",
      providerId: providerId
    });
    
  } catch (err) {
    console.error("Error in deleteProvider controller:", err);
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid provider ID",
        error: "INVALID_ID"
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Database constraint violation",
        error: "CONSTRAINT_VIOLATION"
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      message: "Internal server error while deleting provider",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};


exports.getListingDetails = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const providerId = req.user.id;

    const listing = await providerService.getListingDetails(
      listingId,
      providerId
    );
    if (!listing) {
      return res
        .status(404)
        .json({ message: "Listing not found or not owned by provider" });
    }

    res.json(listing);
  } catch (err) {
    next(err);
  }
};

exports.addListing = async (req, res, next) => {
  try {
    const providerId = req.user.id; // Get provider ID from JWT token

    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    const listingData = req.body;

    // Verify if the provider exists
    const provider = await providerService.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Add owner reference to listing data
    listingData.owner = providerId;
    listingData.ownerType = "Provider";

    // Create new listing using listing service
    const newListing = await listingService.createListing(listingData);

    // Add listing reference to provider's listings array
    provider.listings.push(newListing._id);
    await provider.save();

    // Return the populated listing data
    const populatedListing = await listingService.getListingById(
      newListing._id
    );

    // Send listing creation confirmation email to the provider
    try {
      const emailService = require('../services/email.service');
      
      // Send to provider
      await emailService.sendListingCreationConfirmationEmail(
        provider.email,
        populatedListing
      );
      console.log(`Listing creation confirmation email sent to provider ${provider.email}`);
      
      // Also send to admin
      await emailService.sendListingCreationNotificationToAdmin(
        {...populatedListing.toObject(), owner: provider}
      );
      console.log(`Listing creation notification email sent to admin`);
    } catch (emailError) {
      console.error('Error sending listing creation emails:', emailError);
      // Continue with the process even if the email fails
    }

    res.status(201).json(populatedListing);
  } catch (err) {
    next(err);
  }
};

exports.getProviderProfile = async (req, res, next) => {
  try {
    const providerId = req.user.id;

    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    const provider = await providerService.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Return sanitized profile (no password)
    const profile = {
      id: provider._id,
      username: provider.username,
      email: provider.email,
      firstName: provider.firstName,
      lastName: provider.lastName,
      phoneNumber: provider.phoneNumber,
      profileStatus: provider.profileStatus,
      profilePicture: provider.profilePicture,
      aboutYou: provider.aboutYou,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };

    res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.getProviderAnalytics = async (req, res, next) => {
  try {
    // Add debug log for troubleshooting
    console.log("Provider analytics requested for user ID:", req.user.id);

    const timeRange = req.query.timeRange || "month";
    const providerId = req.user.id;

    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      console.error("Invalid provider ID format:", providerId);
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    // Get provider details
    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Define date ranges based on timeRange
    const currentDate = new Date();
    let startDate;

    switch (timeRange) {
      case "week":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "quarter":
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      case "year":
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
    }

    // Find all listings owned by this provider
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    });

    const listingIds = listings.map((listing) => listing._id);

    // Get bookings for the date range
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: startDate, $lte: currentDate },
    })
      .populate("listing")
      .sort({ createdAt: 1 });

    // Get completed transactions for the provider
    const transactions = await Transaction.find({
      user: providerId,
      date: { $gte: startDate, $lte: currentDate },
      status: "completed",
    }).sort({ date: 1 });

    // Previous period date range
    const previousPeriodEndDate = new Date(startDate);
    previousPeriodEndDate.setDate(startDate.getDate() - 1);

    const previousPeriodStartDate = new Date(previousPeriodEndDate);
    switch (timeRange) {
      case "week":
        previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - 7);
        break;
      case "month":
        previousPeriodStartDate.setMonth(previousPeriodEndDate.getMonth() - 1);
        break;
      case "quarter":
        previousPeriodStartDate.setMonth(previousPeriodEndDate.getMonth() - 3);
        break;
      case "year":
        previousPeriodStartDate.setFullYear(
          previousPeriodEndDate.getFullYear() - 1
        );
        break;
      default:
        previousPeriodStartDate.setMonth(previousPeriodEndDate.getMonth() - 1);
    }

    // Get previous period bookings
    const previousBookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate },
    }).populate("listing");

    // Get previous period transactions
    const previousTransactions = await Transaction.find({
      user: providerId,
      date: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate },
      status: "completed",
    });

    // Calculate performance metrics

    // Total bookings
    const totalBookingsCurrent = bookings.length;
    const totalBookingsPrevious = previousBookings.length;

    // Total revenue from transactions
    const totalRevenueCurrent = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    const totalRevenuePrevious = previousTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Calculate occupancy rate
    const totalAvailableDays = listings.length * timeRangeToDays(timeRange);
    const bookedDays = bookings.reduce((sum, booking) => {
      // Calculate the number of days for this booking
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const days = Math.max(
        1,
        Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      );
      return sum + days;
    }, 0);

    const occupancyRateCurrent =
      totalAvailableDays > 0
        ? Math.min(Math.round((bookedDays / totalAvailableDays) * 100), 100)
        : 0;

    const previousBookedDays = previousBookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const days = Math.max(
        1,
        Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      );
      return sum + days;
    }, 0);

    const occupancyRatePrevious =
      totalAvailableDays > 0
        ? Math.min(
            Math.round((previousBookedDays / totalAvailableDays) * 100),
            100
          )
        : 0;

    // Calculate average nightly rate
    const averageNightlyRateCurrent =
      bookedDays > 0 ? Math.round(totalRevenueCurrent / bookedDays) : 0;

    const averageNightlyRatePrevious =
      previousBookedDays > 0
        ? Math.round(totalRevenuePrevious / previousBookedDays)
        : 0;

    // Process time series data for charts
    const revenueData = processTimeSeriesData(
      transactions,
      timeRange,
      "revenue"
    );
    const bookingData = processTimeSeriesData(bookings, timeRange, "bookings");

    // Process listing-specific analytics
    const listingsAnalytics = await Promise.all(
      listings.map(async (listing) => {
        // Get bookings for this listing in the current period
        const listingBookings = bookings.filter(
          (booking) =>
            booking.listing &&
            booking.listing._id.toString() === listing._id.toString()
        );

        // Get bookings for this listing in the previous period
        const previousListingBookings = previousBookings.filter(
          (booking) =>
            booking.listing &&
            booking.listing._id.toString() === listing._id.toString()
        );

        // Calculate booking change percentage
        const bookingCount = listingBookings.length;
        const previousBookingCount = previousListingBookings.length;
        const bookingChange =
          previousBookingCount > 0
            ? Math.round(
                ((bookingCount - previousBookingCount) / previousBookingCount) *
                  100
              )
            : 0;

        // Calculate revenue for this listing
        const listingRevenue = listingBookings.reduce((sum, booking) => {
          return sum + (booking.totalPrice || 0);
        }, 0);

        // Calculate occupancy rate for this listing
        const listingBookedDays = listingBookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.checkInDate);
          const checkOut = new Date(booking.checkOutDate);
          const days = Math.max(
            1,
            Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
          );
          return sum + days;
        }, 0);

        const listingOccupancyRate = Math.min(
          Math.round((listingBookedDays / timeRangeToDays(timeRange)) * 100),
          100
        );

        // Get reviews for this listing
        const reviews = await Review.find({
          listing: listing._id,
          createdAt: { $gte: startDate, $lte: currentDate },
        });

        // Calculate average rating
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating =
          reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        return {
          id: listing._id,
          title: listing.title || "Unnamed Listing",
          location:
            listing.location && listing.location.address
              ? listing.location.address
              : "Unknown location",
          image:
            listing.photos && listing.photos.length > 0
              ? listing.photos[0]
              : "/src/assets/i1.png",
          occupancyRate: listingOccupancyRate,
          pricing:
            listing.pricePerNight && listing.pricePerNight.price
              ? listing.pricePerNight.price
              : 0,
          bookings: bookingCount,
          bookingChange: bookingChange,
          revenue: listingRevenue,
          rating: averageRating,
        };
      })
    );

    // Generate insights based on data analysis
    const insights = [];

    // Revenue trend insight
    if (
      totalRevenueCurrent > totalRevenuePrevious &&
      totalRevenuePrevious > 0
    ) {
      const revenueIncrease = Math.round(
        ((totalRevenueCurrent - totalRevenuePrevious) / totalRevenuePrevious) *
          100
      );
      insights.push({
        type: "opportunity",
        message: `Your revenue has increased by ${revenueIncrease}% compared to the previous ${timeRange}. Consider optimizing pricing for popular dates.`,
      });
    } else if (
      totalRevenueCurrent < totalRevenuePrevious &&
      totalRevenueCurrent > 0
    ) {
      const revenueDecrease = Math.round(
        ((totalRevenuePrevious - totalRevenueCurrent) / totalRevenuePrevious) *
          100
      );
      insights.push({
        type: "warning",
        message: `Your revenue has decreased by ${revenueDecrease}% compared to the previous ${timeRange}. Consider reviewing your pricing strategy.`,
      });
    }

    // Booking trend insight
    const decliningListings = listingsAnalytics.filter(
      (listing) => listing.bookingChange < -10
    );
    if (decliningListings.length > 0) {
      insights.push({
        type: "warning",
        message: `${decliningListings[0].title} has ${Math.abs(
          decliningListings[0].bookingChange
        )}% fewer bookings compared to the previous ${timeRange}.`,
      });
    }

    // Occupancy insight
    if (occupancyRateCurrent < 50 && listings.length > 0) {
      insights.push({
        type: "tip",
        message:
          "Your occupancy rate is below 50%. Consider offering special promotions or discounts to attract more bookings.",
      });
    }

    // Add general tip
    insights.push({
      type: "tip",
      message:
        "Adding more high-quality photos and detailed descriptions could increase your listing visibility and booking rates.",
    });

    // Return analytics data
    res.json({
      performance: {
        totalBookings: {
          current: totalBookingsCurrent,
          previous: totalBookingsPrevious,
        },
        occupancyRate: {
          current: occupancyRateCurrent,
          previous: occupancyRatePrevious,
        },
        averageNightlyRate: {
          current: averageNightlyRateCurrent,
          previous: averageNightlyRatePrevious,
        },
        totalRevenue: {
          current: totalRevenueCurrent,
          previous: totalRevenuePrevious,
        },
      },
      charts: {
        revenue: revenueData.map((item) => item.revenue),
        bookings: bookingData.map((item) => item.bookings),
      },
      listings: listingsAnalytics,
      insights: insights,
    });
  } catch (err) {
    console.error("Error fetching provider analytics:", err);
    next(err);
  }
};

// Helper function to convert timeRange to days
function timeRangeToDays(timeRange) {
  switch (timeRange) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}

// Helper function to process time series data
function processTimeSeriesData(items, timeRange, dataType) {
  // Different date formats based on time range
  let dateFormat;

  switch (timeRange) {
    case "week":
      dateFormat = { day: "numeric", month: "short" };
      break;
    case "month":
      dateFormat = { day: "numeric", month: "short" };
      break;
    case "quarter":
      dateFormat = { day: "numeric", month: "short" };
      break;
    case "year":
      dateFormat = { month: "short", year: "numeric" };
      break;
    default:
      dateFormat = { day: "numeric", month: "short" };
  }

  // Group data by date
  const groupedData = {};

  items.forEach((item) => {
    const dateField = dataType === "revenue" ? item.date : item.createdAt;
    const date = new Date(dateField);
    const dateKey = date.toLocaleDateString("en-US", dateFormat);

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {
        date: dateKey,
        revenue: 0,
        bookings: 0,
      };
    }

    if (dataType === "revenue") {
      groupedData[dateKey].revenue += item.amount || 0;
    } else {
      groupedData[dateKey].bookings += 1;
    }
  });

  // Convert to array and sort by date
  const result = Object.values(groupedData);
  result.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Ensure we have data for every date in the range
  if (result.length === 0) {
    // Generate mock data if empty
    const mockData = [];
    const numPoints =
      timeRange === "week"
        ? 7
        : timeRange === "month"
        ? 30
        : timeRange === "quarter"
        ? 12
        : timeRange === "year"
        ? 12
        : 30;

    const today = new Date();
    const startDate = new Date(today);

    // Set start date based on time range
    if (timeRange === "week") {
      startDate.setDate(today.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(today.getMonth() - 1);
    } else if (timeRange === "quarter") {
      startDate.setMonth(today.getMonth() - 3);
    } else if (timeRange === "year") {
      startDate.setFullYear(today.getFullYear() - 1);
    }

    for (let i = 0; i < numPoints; i++) {
      const mockDate = new Date(startDate);
      mockDate.setDate(startDate.getDate() + i);

      mockData.push({
        date: mockDate.toLocaleDateString("en-US", dateFormat),
        revenue: 0,
        bookings: 0,
      });
    }

    return mockData;
  }

  return result;
}

exports.getProviderListings = async (req, res, next) => {
  try {
    const providerId = req.user.id;

    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    // Find all listings owned by this provider
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    }).populate("owner");

    res.json(listings);
  } catch (err) {
    console.error("Error fetching provider listings:", err);
    next(err);
  }
};

// For provider to get bookings for their listings
exports.getProviderBookings = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { status = "all", limit } = req.query;

    console.log("Provider bookings requested for provider ID:", providerId);
    console.log("With params:", { status, limit });

    // Find all listings owned by this provider
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    });

    if (!listings || listings.length === 0) {
      return res.json([]); // Return empty array if no listings found
    }

    const listingIds = listings.map((listing) => listing._id);
    console.log(`Found ${listingIds.length} listings for provider`);

    // Build query based on status parameter
    const query = {
      listing: { $in: listingIds },
    };

    if (status !== "all") {
      query.status = status;
    }

    console.log("Booking query:", JSON.stringify(query));

    // Create the booking query with optional limit
    let bookingsQuery = Booking.find(query)
      .populate("user")
      .populate("listing")
      .sort({ createdAt: -1 });

    // Apply limit if provided
    if (limit) {
      bookingsQuery = bookingsQuery.limit(parseInt(limit));
    }

    // Execute query
    const bookings = await bookingsQuery.exec();
    console.log(`Found ${bookings.length} bookings`);

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching provider bookings:", err);
    next(err);
  }
};

exports.getBookingDetails = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const providerId = req.user.id;

    const booking = await providerService.getBookingDetails(
      bookingId,
      providerId
    );
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or not owned by provider" });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.deleteProviderListing = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const providerId = req.user.id;

    // Call the listingService to perform the delete
    const result = await listingService.deleteProviderListing(
      listingId,
      providerId
    );
    if (!result) {
      return res
        .status(404)
        .json({ message: "Listing not found or not owned by provider" });
    }

    res.status(200).json({ message: "listing deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getPublicProviderProfile = async (req, res, next) => {
  try {
    const providerId = req.params.id;

    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    const provider = await providerService.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Return only public information
    const publicProfile = {
      id: provider._id,
      username: provider.username,
      firstName: provider.firstName,
      lastName: provider.lastName,
      profilePicture: provider.profilePicture,
      aboutYou: provider.aboutYou,
    };

    res.json(publicProfile);
  } catch (err) {
    next(err);
  }
};

exports.getPublicProviderListings = async (req, res, next) => {
  try {
    const providerId = req.params.id;

    // Validate if ID is in valid format
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    // Only get active listings for public view
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
      status: "active",
    });

    res.json(listings);
  } catch (err) {
    next(err);
  }
};
