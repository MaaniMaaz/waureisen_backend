// Create this new file: services/listingNotification.service.js
const nodemailer = require('nodemailer');
const Provider = require('../models/provider.model');
const Listing = require('../models/listing.model');

// Create a transporter object - reusing same configuration as email.service.js
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends a listing creation confirmation email to the provider
 * @param {Object} listing - The complete listing object
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendListingCreationEmail = async (listing) => {
  try {
    // Get the provider details
    const provider = await Provider.findById(listing.owner);
    if (!provider) {
      throw new Error(`Provider not found for listing ${listing._id}`);
    }

    const providerEmail = provider.email;
    const providerBookingsUrl = process.env.PROVIDER_LISTINGS_URL || 'https://waureisen.com/provider/bookings';
    
    // Format the price nicely
    const formattedPrice = `${listing.pricePerNight?.price || 0} ${listing.pricePerNight?.currency || 'CHF'}`;
    
    // Create HTML content for email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: providerEmail,
      subject: 'Waureisen - Your Listing Has Been Created!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #B4A481; margin: 0;">Listing Created Successfully!</h2>
            <p style="color: #767676; margin-top: 5px;">Your property listing is now live on Waureisen</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #4D484D;">Listing Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listing.title || 'Your New Property'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Location:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listing.location?.address || 'Address pending'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Price:</p>
              <p style="margin: 5px 0 0; color: #767676;">${formattedPrice} per night</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property Type:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listing.listingType || 'Not specified'}</p>
            </div>
            
            <div>
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Status:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listing.status || 'pending approval'}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #f0f7ff; border-left: 4px solid #4299e1;">
            <h4 style="margin-top: 0; color: #2b6cb0;">What's Next?</h4>
            <p style="margin-bottom: 10px; color: #4a5568;">
              Your listing will be reviewed by our team. Once approved, customers will be able to book your property.
              You'll receive booking notifications via email and can manage all your bookings in your provider dashboard.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${providerBookingsUrl}" style="display: inline-block; background-color: #B4A481; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">View Your Bookings</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #767676; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>The Waureisen Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Listing creation confirmation email sent to provider (${providerEmail}). Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending listing creation confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendListingCreationEmail
};