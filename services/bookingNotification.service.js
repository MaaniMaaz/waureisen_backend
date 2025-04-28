const emailService = require('./email.service');
const Provider = require('../models/provider.model');
const Listing = require('../models/listing.model');
const User = require('../models/user.model');

/**
 * Sends a booking notification email to the owner of a listing
 * @param {Object} booking - The complete booking object
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendBookingNotificationEmail = async (booking) => {
  try {
    // Get the listing details
    const listing = await Listing.findById(booking.listing);
    if (!listing) {
      throw new Error(`Listing not found for booking ${booking._id}`);
    }

    // Get the provider/owner details
    const provider = await Provider.findById(listing.owner);
    if (!provider) {
      throw new Error(`Provider not found for listing ${listing._id}`);
    }

    // Get the customer details
    const customer = await User.findById(booking.user);
    if (!customer) {
      throw new Error(`Customer not found for booking ${booking._id}`);
    }

    // Prepare booking data for email
    const bookingData = {
      _id: booking._id,
      listingTitle: listing.title,
      customerName: `${customer.firstName} ${customer.lastName}`,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      capacity: booking.capacity || { people: 1, dogs: 0 },
      totalPrice: booking.totalPrice,
      currency: 'CHF', // Default currency
      status: booking.status
    };

    // Send the email notification
    const result = await emailService.sendBookingNotificationToProvider(
      provider.email,
      bookingData
    );

    console.log(`Booking notification sent to provider ${provider.email} for booking ${booking._id}`);
    return result;

  } catch (error) {
    console.error(`Error sending booking notification: ${error.message}`);
    throw error;
  }
};

/**
 * Sends a booking acceptance notification email to the customer
 * @param {Object} booking - The complete booking object
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendBookingAcceptanceEmail = async (booking) => {
  try {
    // Get the listing details
    const listing = await Listing.findById(booking.listing);
    if (!listing) {
      throw new Error(`Listing not found for booking ${booking._id}`);
    }

    // Get the provider/owner details
    const provider = await Provider.findById(listing.owner);
    if (!provider) {
      throw new Error(`Provider not found for listing ${listing._id}`);
    }

    // Get the customer details
    const customer = await User.findById(booking.user);
    if (!customer) {
      throw new Error(`Customer not found for booking ${booking._id}`);
    }

    // Prepare booking data for email
    const bookingData = {
      _id: booking._id,
      listingTitle: listing.title,
      providerName: `${provider.firstName} ${provider.lastName}`,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      capacity: booking.capacity || { people: 1, dogs: 0 },
      totalPrice: booking.totalPrice,
      currency: 'CHF', // Default currency
      status: booking.status
    };

    // Send the email notification
    const result = await emailService.sendBookingAcceptanceToCustomer(
      customer.email,
      bookingData
    );

    console.log(`Booking acceptance notification sent to customer ${customer.email} for booking ${booking._id}`);
    return result;

  } catch (error) {
    console.error(`Error sending booking acceptance notification: ${error.message}`);
    throw error;
  }
};

/**
 * Sends a booking rejection notification email to the customer
 * @param {Object} booking - The complete booking object
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendBookingRejectionEmail = async (booking) => {
  try {
    // Get the listing details
    const listing = await Listing.findById(booking.listing);
    if (!listing) {
      throw new Error(`Listing not found for booking ${booking._id}`);
    }

    // Get the provider/owner details
    const provider = await Provider.findById(listing.owner);
    if (!provider) {
      throw new Error(`Provider not found for listing ${listing._id}`);
    }

    // Get the customer details
    const customer = await User.findById(booking.user);
    if (!customer) {
      throw new Error(`Customer not found for booking ${booking._id}`);
    }

    // Prepare booking data for email
    const bookingData = {
      _id: booking._id,
      listingTitle: listing.title,
      providerName: `${provider.firstName} ${provider.lastName}`,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      capacity: booking.capacity || { people: 1, dogs: 0 },
      totalPrice: booking.totalPrice,
      currency: 'CHF', // Default currency
      status: booking.status
    };

    // Send the email notification
    const result = await emailService.sendBookingRejectionToCustomer(
      customer.email,
      bookingData
    );

    console.log(`Booking rejection notification sent to customer ${customer.email} for booking ${booking._id}`);
    return result;

  } catch (error) {
    console.error(`Error sending booking rejection notification: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendBookingNotificationEmail,
  sendBookingAcceptanceEmail,
  sendBookingRejectionEmail
};