const Provider = require("../models/provider.model");
const Listing = require("../models/listing.model");
const Booking = require("../models/booking.model");
const UnavailableDate = require("../models/unavailableDate.model");
const Transaction = require("../models/transaction.model");  // Add this line
const Review = require("../models/review.model");      

// Basic provider operations
exports.getProviderById = async (id) => {
  return await Provider.findById(id);
};

exports.getProviderListings = async (providerId) => {
  return await Listing.find({
    owner: providerId,
    ownerType: "Provider",
  })
  .select("title location status pricePerNight images listingType totalBookings source createdAt")
  .populate("owner", "username email profilePicture")
  .sort({ createdAt: -1 }); // Sort by creation date in descending order (newest first)
};

// Get listing details
// exports.getListingDetails = async (listingId, providerId) => {
//   return await Listing.findOne({
//     _id: listingId,
//     owner: providerId,
//     ownerType: "Provider",
//   });
// };


exports.unblockDates = async (providerId, listingId, dates) => {
  try {
    console.log(`Attempting to unblock dates for listing ${listingId} by provider ${providerId}`);
    console.log(`Dates to unblock:`, dates);
    
    // Verify listing ownership
    const listing = await Listing.findOne({
      _id: listingId,
      owner: providerId,
      ownerType: "Provider",
    });

    if (!listing) {
      throw new Error("Listing not found or not owned by provider");
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("No dates provided for unblocking");
    }

    // Get the UnavailableDate model
    const UnavailableDate = require('../models/unavailableDate.model');
    
    // First, log what dates we're trying to remove
    console.log(`Attempting to remove the following dates from UnavailableDate collection:`);
    dates.forEach(date => console.log(` - ${date}`));
    
    // Fetch the actual documents we're going to delete (for logging purpose)
    const documentsToDelete = await UnavailableDate.find({
      listing: listingId,
      date: { $in: dates.map(dateStr => new Date(dateStr)) }
    });
    
    console.log(`Found ${documentsToDelete.length} matching documents to delete`);
    documentsToDelete.forEach(doc => {
      console.log(` - Document ID: ${doc._id}, Date: ${doc.date}, Format: ${typeof doc.date}`);
    });
    
    // Try delete with the date objects
    const result = await UnavailableDate.deleteMany({
      listing: listingId,
      date: { $in: dates.map(dateStr => new Date(dateStr)) }
    });
    
    console.log(`DeleteMany result: ${JSON.stringify(result)}`);
    
    // If no documents were deleted, maybe the dates are stored differently
    if (result.deletedCount === 0) {
      console.log("No documents deleted with Date objects. Trying with string format...");
      
      // Try deleting with the exact string format
      const resultWithStrings = await UnavailableDate.deleteMany({
        listing: listingId,
        date: { $in: dates }
      });
      
      console.log(`DeleteMany with strings result: ${JSON.stringify(resultWithStrings)}`);
      
      if (resultWithStrings.deletedCount === 0) {
        // If still no luck, try another approach - delete one by one with date comparison
        console.log("Still no success. Trying one-by-one deletion with date comparison...");
        
        let deleteCount = 0;
        for (const dateStr of dates) {
          // Convert date string to start/end of day to catch any time variations
          const startDate = new Date(dateStr);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(dateStr);
          endDate.setHours(23, 59, 59, 999);
          
          const deleteResult = await UnavailableDate.deleteMany({
            listing: listingId,
            date: { $gte: startDate, $lte: endDate }
          });
          
          deleteCount += deleteResult.deletedCount;
          console.log(`Deleted ${deleteResult.deletedCount} documents for date ${dateStr}`);
        }
        
        console.log(`Total deleted with date range approach: ${deleteCount}`);
        return { deletedCount: deleteCount };
      }
      
      return resultWithStrings;
    }
    
    return result;
  } catch (error) {
    console.error("Error unblocking dates:", error);
    throw error;
  }
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
      registrationStatus: data?.step === 4 ? "complete" : "incomplete",
      profileStatus: "pending verification",
      profileCompleted:data?.step === 4 ? true : false,
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
        { checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        // Booking spans the entire blocked period
        { checkInDate: { $lte: new Date(startDate) }, checkOutDate: { $gte: new Date(endDate) } },
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

    // First, check for existing blocked dates in the range
    const existingBlockedDates = await UnavailableDate.find({
      listing: listingId,
      date: {
        $gte: new Date(startDate + 'T00:00:00.000Z'),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      }
    });

    // Create a Set of existing dates for quick lookup
    const existingDatesSet = new Set(
      existingBlockedDates.map(doc => {
        const date = new Date(doc.date);
        return date.toISOString().split('T')[0];
      })
    );

    const blockedDates = [];

    // Create start and end dates with proper time components
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    // Log the date range we're working with
    console.log('Date range for blocking:', {
      start: start.toISOString(),
      end: end.toISOString()
    });

    // Create entries for each day in the range
    let currentDate = new Date(start);
    while (currentDate.toISOString().split('T')[0] <= end.toISOString().split('T')[0]) {
      // Format date to YYYY-MM-DD for comparison
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Only add if date doesn't already exist
      if (!existingDatesSet.has(dateStr)) {
        // Create a new date object for each day
        const dateClone = new Date(currentDate);
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
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Creating ${blockedDates.length} unavailable date entries`);
    console.log('Dates to be blocked:', blockedDates.map(d => d.date.toISOString().split('T')[0]));
    
    if (blockedDates.length === 0) {
      return { message: "All dates in the range are already blocked" };
    }

    // Use insertMany with ordered: false to continue even if some entries fail
    const result = await UnavailableDate.insertMany(blockedDates, { ordered: false })
      .catch(error => {
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


 

// Then your deleteProvider function should work correctly:
exports.deleteProvider = async (providerId) => {
  try {
    console.log(`Starting deletion process for provider: ${providerId}`);
    
    // Validate provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      console.log(`Provider ${providerId} not found`);
      return false;
    }

    // Step 1: Find all listings owned by this provider
    const listings = await Listing.find({
      owner: providerId,
      ownerType: "Provider",
    });
    
    const listingIds = listings.map(listing => listing._id);
    console.log(`Found ${listings.length} listings to delete`);

    // Step 2: Delete all bookings for these listings
    if (listingIds.length > 0) {
      const bookingDeleteResult = await Booking.deleteMany({
        listing: { $in: listingIds }
      });
      console.log(`Deleted ${bookingDeleteResult.deletedCount} bookings`);

      // Step 3: Delete all unavailable dates for these listings
      const unavailableDatesResult = await UnavailableDate.deleteMany({
        listing: { $in: listingIds }
      });
      console.log(`Deleted ${unavailableDatesResult.deletedCount} unavailable dates`);

      // Step 4: Delete all reviews for these listings
      const reviewDeleteResult = await Review.deleteMany({
        listing: { $in: listingIds }
      });
      console.log(`Deleted ${reviewDeleteResult.deletedCount} reviews`);

      // Step 5: Delete all listings
      const listingDeleteResult = await Listing.deleteMany({
        owner: providerId,
        ownerType: "Provider"
      });
      console.log(`Deleted ${listingDeleteResult.deletedCount} listings`);
    }

    // Step 6: Delete transactions related to this provider
    const transactionDeleteResult = await Transaction.deleteMany({
      user: providerId
    });
    console.log(`Deleted ${transactionDeleteResult.deletedCount} transactions`);

    // Step 7: Finally delete the provider
    const result = await Provider.findByIdAndDelete(providerId);
    
    if (result) {
      console.log(`Successfully deleted provider: ${providerId}`);
      return true;
    } else {
      console.log(`Failed to delete provider: ${providerId}`);
      return false;
    }

  } catch (error) {
    console.error(`Error deleting provider ${providerId}:`, error);
    throw error;
  }
};






// /extra code
exports.createListingWithFilters = async (listingData) => {
  try {
    const { filterData, ...actualListingData } = listingData;
    // Create the listing first
    const Listing = require('../models/listing.model');
    const listing = new Listing(actualListingData);
    const savedListing = await listing.save();
    if (savedListing && filterData) {
      // Create the filter document linked to this specific listing
      filterData.listing = savedListing._id;
      filterData.isTemplate = false; // This is NOT a template
      const filter = new Filter(filterData);
      const savedFilter = await filter.save();
      // Update the listing with the filter reference
      if (savedFilter) {
        savedListing.filters = savedFilter._id;
        await savedListing.save();
      }
      console.log('Created listing with filter:', {
        listingId: savedListing._id,
        filterId: savedFilter._id
      });
    }
    return savedListing;
  } catch (error) {
    console.error('Error creating listing with filters:', error);
    throw error;
  }
};
// Update the existing getListingDetails function to populate filters
exports.getListingDetails = async (listingId, providerId) => {
  try {
    const listing = await Listing.findOne({
      _id: listingId,
      owner: providerId,
      ownerType: "Provider",
    }).populate("filters"); // Populate the filter data

    console.log("filter wala data" , listing)
    return listing;
  } catch (error) {
    console.error('Error getting listing details:', error);
    throw error;
  }
};