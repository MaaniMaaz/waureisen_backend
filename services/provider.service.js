const Provider = require("../models/provider.model");
const Listing = require("../models/listing.model");
const Booking = require("../models/booking.model");
const UnavailableDate = require("../models/unavailableDate.model");

// Basic provider operations
exports.getProviderById = async (id) => {
  return await Provider.findById(id);
};

// Get provider's listings (basic info)
exports.getProviderListings = async (providerId) => {
  return await Listing.find({
    owner: providerId,
    ownerType: "Provider",
  }).select("title location status");
};

// Get listing details
exports.getListingDetails = async (listingId, providerId) => {
  return await Listing.findOne({
    _id: listingId,
    owner: providerId,
    ownerType: "Provider",
  });
};

exports.getProviderBookings = async (providerId, filters = {}) => {
  try {
    // Get provider's listings first
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    }).select("_id");

    const listingIds = listings.map((listing) => listing._id);

    // Build the query
    const query = {
      listing: { $in: listingIds },
    };

    // Add filters if provided
    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters.listingId) {
      query.listing = filters.listingId;
    }

    // Pagination parameters
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await Booking.countDocuments(query);

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate("user", "username firstName lastName email")
      .populate("listing", "title location images")
      .sort({ checkInDate: filters.sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    return {
      bookings,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error getting provider bookings:", error);
    throw error;
  }
};

exports.getBookingDetails = async (bookingId, providerId) => {
  try {
    // Get provider's listings first
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    }).select("_id");

    const listingIds = listings.map((listing) => listing._id);

    // Find booking that belongs to one of provider's listings
    const booking = await Booking.findOne({
      _id: bookingId,
      listing: { $in: listingIds },
    })
      .populate("user", "username firstName lastName email")
      .populate("listing", "title location images");

    return booking;
  } catch (error) {
    console.error("Error getting booking details:", error);
    throw error;
  }
};

// Get user details for a booking
exports.getBookingUserDetails = async (userId) => {
  const User = require("../models/user.model"); // Import at function level to avoid circular dependency
  return await User.findById(userId).select(
    "username firstName lastName email"
  );
};

exports.getUnavailableDates = async (providerId, filters = {}) => {
  try {
    console.log('Getting unavailable dates with filters:', filters);
    
    let query = {};

    // If listingId is provided, filter by specific listing
    if (filters.listingId) {
      query.listing = filters.listingId;
    } else {
      // Otherwise, get all provider's listings
      const listings = await Listing.find({
        owner: providerId,
        ownerType: "Provider",
      }).select("_id");

      const listingIds = listings.map((listing) => listing._id);
      query.listing = { $in: listingIds };
    }

    // Add date range filters if provided with inclusive boundary dates
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      
      const endDate = new Date(filters.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      query.date = { $gte: startDate };
    } else if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      query.date = { $lte: endDate };
    }

    console.log('Unavailable dates query:', JSON.stringify(query));

    // Get all unavailable dates matching the query
    const unavailableDates = await UnavailableDate.find(query)
      .populate("listing", "title")
      .sort({ date: 1 });

    console.log(`Found ${unavailableDates.length} unavailable dates`);

    // Transform dates for easier frontend handling
    const formattedDates = unavailableDates.map((record) => {
      // Format date to YYYY-MM-DD to avoid timezone issues
      const date = new Date(record.date);
      const formattedDate = date.toISOString().split('T')[0];
      
      return {
        id: record._id,
        date: formattedDate,
        listing: record.listing._id || record.listing,
        listingId: record.listing._id || record.listing,
        listingTitle: record.listing.title || "Property",
        reason: record.reason,
      };
    });
    
    console.log('Formatted unavailable dates:', formattedDates);
    return formattedDates;
  } catch (error) {
    console.error("Error getting unavailable dates:", error);
    throw error;
  }
};

exports.createProvider = async (data) => {
  const newProvider = new Provider({
    ...data,
    registrationStatus: "incomplete",
  });
  return await newProvider.save();
};

exports.updateProvider = async (id, data) => {
  try {
    return await Provider.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error("Error updating provider:", error);
    throw error;
  }
};

exports.completeProviderRegistration = async (providerId, data) => {
  return await Provider.findByIdAndUpdate(
    providerId,
    {
      ...data,
      registrationStatus: "complete",
      profileStatus: "pending verification",
    },
    { new: true }
  );
};

// Block dates
exports.blockDates = async (providerId, blockData) => {
  try {
    const { listingId, startDate, endDate, reason } = blockData;
    
    console.log('Provider attempting to block dates:', {
      providerId,
      listingId,
      startDate,
      endDate,
      reason
    });

    // Verify listing ownership
    const listing = await Listing.findOne({
      _id: listingId,
      owner: providerId,
      ownerType: "Provider",
    });

    if (!listing) {
      throw new Error("Listing not found or not owned by provider");
    }

    // Check for overlapping bookings
    const bookings = await Booking.find({
      listing: listingId,
      $or: [
        // Booking starts during the blocked period
        { checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        // Booking ends during the blocked period
        {
          checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
        // Booking spans the entire blocked period
        {
          checkInDate: { $lte: new Date(startDate) },
          checkOutDate: { $gte: new Date(endDate) },
        },
      ],
      status: { $in: ["confirmed", "pending"] },
    });

    if (bookings.length > 0) {
      throw new Error("Cannot block dates that overlap with existing bookings");
    }

    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(startDate) < today) {
      throw new Error("Cannot block dates in the past");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const blockedDates = [];

    // Create entries for each day in the range
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      // Create a new date object for each day to avoid reference issues
      const dateClone = new Date(date);
      // Set to noon UTC to avoid timezone issues
      dateClone.setUTCHours(12, 0, 0, 0);
      
      blockedDates.push({
        listing: listingId,
        date: dateClone,
        reason,
        createdBy: providerId,
        createdByType: "Provider",
      });
    }
    
    console.log(`Creating ${blockedDates.length} unavailable date entries`);
    
    // Use insertMany with ordered: false to continue even if some entries fail due to duplicates
    const result = await UnavailableDate.insertMany(blockedDates, { ordered: false })
      .catch(error => {
        // Handle duplicate key errors (some dates might already be blocked)
        if (error.code === 11000) {
          console.log('Some dates already blocked (duplicate key error):', error.message);
          return error.insertedDocs || [];
        }
        throw error;
      });
    
    console.log(`Successfully created ${result.length} unavailable date entries`);
    return result;
  } catch (error) {
    console.error("Error blocking dates:", error);
    throw error;
  }
};

exports.getProviderByEmail = async (email) => {
  return await Provider.findOne({ email });
const mongoose = require('mongoose');
const Provider = require('../models/provider.model'); // Adjust path as needed
// If you're using User model instead of a separate Provider model
// const User = require('../models/user.model');

// Get all providers
exports.getAllProviders = async () => {
  const providers = await Provider.find();
  return providers;
};

// Get provider by ID
exports.getProviderById = async (id) => {
  // Check if the ID is a valid MongoDB ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid provider ID format');
  }
  const provider = await Provider.findById(id);
  return provider;
};

// Get provider by email
exports.getProviderByEmail = async (email) => {
  const provider = await Provider.findOne({ email });
  return provider;
};

// Create a new provider
exports.createProvider = async (providerData) => {
  const newProvider = new Provider(providerData);
  return await newProvider.save();
};

// Update a provider
exports.updateProvider = async (id, updateData) => {
  // Check if the ID is a valid MongoDB ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid provider ID format');
  }
  const updatedProvider = await Provider.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  return updatedProvider;
};

// Delete a provider
exports.deleteProvider = async (id) => {
  // Check if the ID is a valid MongoDB ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid provider ID format');
  }
  await Provider.findByIdAndDelete(id);
  return;
};

// Simple format Date function to format dates for charts
function formatDate(date, format) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  } else if (format === "YYYY-MM") {
    return `${year}-${month}`;
  } else if (format === "DD MMM") {
    return `${day} ${monthNames[d.getMonth()]}`;
  } else if (format === "MMM YYYY") {
    return `${monthNames[d.getMonth()]} ${year}`;
  }

  return `${year}-${month}-${day}`; // Default
}

exports.getProviderAnalytics = async (providerId, timeRange = "month") => {
  try {
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    }).select("_id");

    const listingIds = listings.map((listing) => listing._id);

    // Determine date range
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of current day

    let startDate = new Date();
    let dateFormat; // Format for grouping dates
    let numPoints; // Number of data points on x-axis

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 6); // Last 7 days (including today)
        startDate.setHours(0, 0, 0, 0); // Start of day
        dateFormat = "YYYY-MM-DD"; // Daily format
        numPoints = 7;
        break;
      case "month":
        startDate.setDate(now.getDate() - 29); // Last 30 days (including today)
        startDate.setHours(0, 0, 0, 0);
        dateFormat = "YYYY-MM-DD"; // Daily format
        numPoints = 30;
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setDate(startDate.getDate() + 1); // Last 365 days (including today)
        startDate.setHours(0, 0, 0, 0);
        dateFormat = "YYYY-MM"; // Monthly format
        numPoints = 12;
        break;
      default:
        startDate.setDate(now.getDate() - 29); // Default to month
        startDate.setHours(0, 0, 0, 0);
        dateFormat = "YYYY-MM-DD";
        numPoints = 30;
    }

    // Get all bookings for this provider's listings in the date range
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      // At least part of the booking falls within our date range
      $or: [
        { checkInDate: { $gte: startDate, $lte: now } }, // Starts in range
        { checkOutDate: { $gte: startDate, $lte: now } }, // Ends in range
        {
          $and: [
            // Spans the entire range
            { checkInDate: { $lte: startDate } },
            { checkOutDate: { $gte: now } },
          ],
        },
      ],
    }).populate("listing", "title");

    // Get confirmed bookings only for revenue calculation
    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed"
    );

    // Calculate basic metrics for the dashboard
    const totalBookings = {
      current: bookings.length,
      previous: Math.floor(bookings.length * 0.8), // Simplistic previous period calculation
    };

    // Calculate total revenue from confirmed bookings only
    let totalRevenue = 0;
    confirmedBookings.forEach((booking) => {
      totalRevenue += booking.totalPrice || 0;
    });

    // Calculate occupancy rate
    // First, get the total available days in the period for all listings
    const periodLength = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const totalAvailableDays = periodLength * listings.length;

    // Next, calculate the total booked days
    let totalBookedDays = 0;
    confirmedBookings.forEach((booking) => {
      const bookingStart = new Date(Math.max(booking.checkInDate, startDate));
      const bookingEnd = new Date(Math.min(booking.checkOutDate, now));

      if (bookingEnd >= bookingStart) {
        const days = Math.ceil(
          (bookingEnd - bookingStart) / (1000 * 60 * 60 * 24)
        );
        totalBookedDays += days;
      }
    });

    // Calculate occupancy rate (prevent divide by zero)
    const occupancyRate = {
      current:
        totalAvailableDays > 0
          ? Math.round((totalBookedDays / totalAvailableDays) * 100)
          : 0,
      previous:
        totalAvailableDays > 0
          ? Math.round((totalBookedDays / totalAvailableDays) * 100 * 0.9)
          : 0, // Assuming 10% less in previous period
    };

    // Create data structures for the charts
    // Initialize date-based maps to hold our data
    const revenueByDate = new Map();
    const bookingsByDate = new Map();

    // Initialize all dates in the range
    let dateLabels = [];
    if (timeRange === "year") {
      // For yearly view, initialize months
      for (let i = 0; i < 12; i++) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 11 + i);
        const monthLabel = formatDate(d, "YYYY-MM");
        revenueByDate.set(monthLabel, 0);
        bookingsByDate.set(monthLabel, 0);
        dateLabels.push(formatDate(d, "MMM YYYY")); // Formatted month name for display
      }
    } else {
      // For daily view (week or month)
      for (let i = 0; i < numPoints; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateLabel = formatDate(d, "YYYY-MM-DD");
        revenueByDate.set(dateLabel, 0);
        bookingsByDate.set(dateLabel, 0);
        dateLabels.push(formatDate(d, "DD MMM")); // Formatted day for display
      }
    }

    // Process each booking and distribute revenue across days
    confirmedBookings.forEach((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);

      // Calculate number of days in booking
      const totalDays = Math.max(
        1,
        Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      );

      // Calculate revenue per day
      const revenuePerDay = (booking.totalPrice || 0) / totalDays;

      // For each day of the booking, add the daily revenue
      for (
        let day = new Date(Math.max(checkIn, startDate));
        day <= new Date(Math.min(checkOut, now));
        day.setDate(day.getDate() + 1)
      ) {
        let dateKey;
        if (timeRange === "year") {
          dateKey = formatDate(day, "YYYY-MM");
        } else {
          dateKey = formatDate(day, "YYYY-MM-DD");
        }

        // Add revenue for this day/month if the key exists
        if (revenueByDate.has(dateKey)) {
          revenueByDate.set(
            dateKey,
            revenueByDate.get(dateKey) + revenuePerDay
          );
        }
      }

      // For booking count, we count a booking in every period it spans
      if (timeRange === "year") {
        // Count by month
        const startMonth = new Date(Math.max(checkIn, startDate));
        const endMonth = new Date(Math.min(checkOut, now));

        // Set startMonth to the 1st of the month
        startMonth.setDate(1);

        // Set endMonth to the 1st of the next month
        endMonth.setDate(1);
        if (endMonth.getMonth() === 11) {
          endMonth.setFullYear(endMonth.getFullYear() + 1);
          endMonth.setMonth(0);
        } else {
          endMonth.setMonth(endMonth.getMonth() + 1);
        }

        // Count booking for each month it spans
        for (
          let month = new Date(startMonth);
          month < endMonth;
          month.setMonth(month.getMonth() + 1)
        ) {
          const monthKey = formatDate(month, "YYYY-MM");
          if (bookingsByDate.has(monthKey)) {
            bookingsByDate.set(monthKey, bookingsByDate.get(monthKey) + 1);
          }
        }
      } else {
        // Count by day
        for (
          let day = new Date(Math.max(checkIn, startDate));
          day <= new Date(Math.min(checkOut, now));
          day.setDate(day.getDate() + 1)
        ) {
          const dateKey = formatDate(day, "YYYY-MM-DD");
          if (bookingsByDate.has(dateKey)) {
            bookingsByDate.set(dateKey, bookingsByDate.get(dateKey) + 1);
          }
        }
      }
    });

    // Convert to arrays for charting
    const revenueData = Array.from(revenueByDate.values());
    const bookingsData = Array.from(bookingsByDate.values());

    return {
      timeRange,
      performance: {
        totalBookings,
        totalRevenue: {
          current: totalRevenue,
          previous: Math.floor(totalRevenue * 0.85),
        },
        occupancyRate,
      },
      charts: {
        labels: dateLabels,
        revenue: revenueData,
        bookings: bookingsData,
      },
    };
  } catch (error) {
    console.error("Error calculating provider analytics:", error);
    throw error;
  }
};




exports.updateProvider = async (providerId, updateData) => {
  try {
    console.log(`Updating provider ${providerId} with data:`, updateData);
    
    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      updateData,
      { new: true } // Return the updated document
    );
    
    console.log('Provider update result:', updatedProvider ? 'Success' : 'Failed');
    return updatedProvider;
  } catch (error) {
    console.error('Error in updateProvider service function:', error);
    throw error;
  }
};


exports.updateProviderBanking = async (providerId, bankingData) => {
  try {
    const { bankName, accountHolder, iban, swift } = bankingData;
    
    const updateData = {
      bankName,
      accountHolder,
      iban,
      swift: swift || ''
    };
    
    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      updateData,
      { new: true }
    );
    
    return updatedProvider;
  } catch (error) {
    console.error('Error updating provider banking details:', error);
    throw error;
  }
};
 

exports.updateProviderPassword = async (providerId, hashedPassword) => {
  try {
    const result = await Provider.findByIdAndUpdate(
      providerId,
      { password: hashedPassword }
    );
    
    return !!result; // Convert to boolean - true if update successful
  } catch (error) {
    console.error('Error updating provider password:', error);
    throw error;
  }
};


exports.updateProviderSettings = async (providerId, settings) => {
  try {
    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      { settings },
      { new: true }
    );
    
    return updatedProvider;
  } catch (error) {
    console.error('Error updating provider settings:', error);
    throw error;
  }
};