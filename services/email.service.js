const nodemailer = require('nodemailer');

// Create a transporter object with Hostpoint-specific settings
const transporter = nodemailer.createTransport({
  host: 'asmtp.mail.hostpoint.ch', // Use asmtp instead of mail
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER || 'hallo@waureisen.com', // Full email address
    pass: process.env.EMAIL_PASSWORD || 'Waureisen2024+',
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  debug: true, // Enable verbose logging (for debugging only - remove in production)
});

// Optional: Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP Server connection error:', error);
  } else {
    console.log('SMTP Server connection established');
  }
});

// The rest of your email service code remains the same
// Store verification codes with expiration
const verificationCodes = new Map();

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code, userType) => {
  try {
    const greeting = userType === 'provider' ? 'Hello Provider' : 'Hello Customer';
    
    const mailOptions = {
      from: {
        name: 'Waureisen',
        address: process.env.EMAIL_USER || 'hallo@waureisen.com'
      },
      to: email,
      subject: 'Waureisen - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #B4A481;">${greeting}</h2>
          <p>Thank you for signing up with Waureisen!</p>
          <p>Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br/>The Waureisen Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Create a verification code for an email
const createVerificationCode = async (email, userType) => {
  const code = generateVerificationCode();
  
  // Store the code with expiration (10 minutes)
  verificationCodes.set(email, {
    code,
    userType,
    expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
  });
  
  // Set timeout to remove the code after expiration
  setTimeout(() => {
    verificationCodes.delete(email);
  }, 10 * 60 * 1000);
  
  // Send the email with the code
  await sendVerificationEmail(email, code, userType);
  
  return { success: true };
};

// Verify the code entered by user
const verifyCode = (email, code) => {
  const storedData = verificationCodes.get(email);
  
  if (!storedData) {
    return { verified: false, message: 'Verification code expired or not found' };
  }
  
  if (storedData.code !== code) {
    return { verified: false, message: 'Invalid verification code' };
  }
  
  if (Date.now() > storedData.expiry) {
    verificationCodes.delete(email);
    return { verified: false, message: 'Verification code expired' };
  }
  
  // Code is valid - remove it from storage
  verificationCodes.delete(email);
  
  return { verified: true, userType: storedData.userType };
};

// Send booking notification to provider
const sendBookingNotificationToProvider = async (providerEmail, bookingData) => {
  try {
    const providerBookingsUrl = process.env.PROVIDER_BOOKINGS_URL || 'https://waureisen.com/provider/bookings';
    
    // Format dates nicely
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const checkInDate = formatDate(bookingData.checkInDate);
    const checkOutDate = formatDate(bookingData.checkOutDate);
    
    // Create booking approval link
    const approvalLink = `${providerBookingsUrl}?id=${bookingData._id}`;
    
    // Create HTML content for email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hallo@waureisen.com',
      to: providerEmail,
      subject: 'Waureisen - New Booking Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #B4A481; margin: 0;">New Booking Request</h2>
            <p style="color: #767676; margin-top: 5px;">A customer has requested to book your property</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #4D484D;">Booking Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.listingTitle}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Guest:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.customerName}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Dates:</p>
              <p style="margin: 5px 0 0; color: #767676;">Check-in: ${checkInDate}</p>
              <p style="margin: 5px 0 0; color: #767676;">Check-out: ${checkOutDate}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Guests:</p>
              <p style="margin: 5px 0 0; color: #767676;">
                ${bookingData.capacity.people} ${bookingData.capacity.people > 1 ? 'people' : 'person'}, 
                ${bookingData.capacity.dogs} ${bookingData.capacity.dogs > 1 ? 'dogs' : 'dog'}
              </p>
            </div>
            
            <div>
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Total Price:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.totalPrice} ${bookingData.currency || 'CHF'}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="margin-bottom: 15px; color: #767676;">Please approve or reject this booking request:</p>
            <a href="${approvalLink}" style="display: inline-block; background-color: #B4A481; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">View Booking Details</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #767676; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>The Waureisen Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking notification email sent to provider (${providerEmail}). Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending booking notification email:', error);
    throw new Error('Failed to send booking notification email');
  }
};

const sendBookingAcceptanceToCustomer = async (customerEmail, bookingData) => {
  try {
    const userTripsUrl = process.env.USER_TRIPS_URL || 'https://waureisen.com/trips';
    const userMessagesUrl = process.env.USER_MESSAGES_URL || 'https://waureisen.com/messages';
    
    // Format dates nicely
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const checkInDate = formatDate(bookingData.checkInDate);
    const checkOutDate = formatDate(bookingData.checkOutDate);
    
    // Create trip details link
    const tripDetailsLink = `${userTripsUrl}?id=${bookingData._id}`;
    const messagesLink = `${userMessagesUrl}`;
    
    // Create HTML content for email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hallo@waureisen.com',
      to: customerEmail,
      subject: 'Waureisen - Your Booking Has Been Confirmed!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #B4A481; margin: 0;">Booking Confirmed!</h2>
            <p style="color: #767676; margin-top: 5px;">Your booking request has been approved by the property owner</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #4D484D;">Booking Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.listingTitle}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Host:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.providerName}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Dates:</p>
              <p style="margin: 5px 0 0; color: #767676;">Check-in: ${checkInDate}</p>
              <p style="margin: 5px 0 0; color: #767676;">Check-out: ${checkOutDate}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Guests:</p>
              <p style="margin: 5px 0 0; color: #767676;">
                ${bookingData.capacity.people} ${bookingData.capacity.people > 1 ? 'people' : 'person'}, 
                ${bookingData.capacity.dogs} ${bookingData.capacity.dogs > 1 ? 'dogs' : 'dog'}
              </p>
            </div>
            
            <div>
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Total Price:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.totalPrice} ${bookingData.currency || 'CHF'}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #f0f7ff; border-left: 4px solid #4299e1;">
            <h4 style="margin-top: 0; color: #2b6cb0;">What's Next?</h4>
            <p style="margin-bottom: 10px; color: #4a5568;">
              Your booking is now confirmed. The property owner may contact you with additional details. Please prepare for 
              your stay and make sure to review any house rules or instructions for check-in.
            </p>
            <p style="margin-bottom: 0; color: #4a5568; font-weight: bold;">
              A MESSAGE HAS BEEN SENT TO YOUR INBOX. <a href="${messagesLink}" style="color: #4299e1; text-decoration: underline;">Check your messages</a> for communication from the host.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${tripDetailsLink}" style="display: inline-block; background-color: #B4A481; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin-right: 10px;">View Trip Details</a>
            <a href="${messagesLink}" style="display: inline-block; background-color: #4299e1; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">View Messages</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #767676; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>The Waureisen Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking acceptance email sent to customer (${customerEmail}). Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending booking acceptance email:', error);
    throw new Error('Failed to send booking acceptance email');
  }
};

const sendListingCreationConfirmationEmail = async (providerEmail, listingData) => {
  try {
    const providerBookingsUrl = process.env.PROVIDER_LISTINGS_URL || 'https://waureisen.com/provider/bookings';
    
    // Format the price nicely
    const formattedPrice = `${listingData.pricePerNight?.price || 0} ${listingData.pricePerNight?.currency || 'CHF'}`;
    
    // Create HTML content for email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hallo@waureisen.com',
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
              <p style="margin: 5px 0 0; color: #767676;">${listingData.title || 'Your New Property'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Location:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.location?.address || 'Address pending'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Price:</p>
              <p style="margin: 5px 0 0; color: #767676;">${formattedPrice} per night</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property Type:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.listingType || 'Not specified'}</p>
            </div>
            
            <div>
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Status:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.status || 'pending approval'}</p>
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
    throw new Error('Failed to send listing creation confirmation email');
  }
};

// Send booking rejection notification to customer
const sendBookingRejectionToCustomer = async (customerEmail, bookingData) => {
  try {
    const searchUrl = process.env.SEARCH_LISTINGS_URL || 'https://waureisen.com/search';
    
    // Format dates nicely
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const checkInDate = formatDate(bookingData.checkInDate);
    const checkOutDate = formatDate(bookingData.checkOutDate);
    
    // Create HTML content for email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hallo@waureisen.com',
      to: customerEmail,
      subject: 'Waureisen - Booking Request Not Available',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #B4A481; margin: 0;">Booking Request Update</h2>
            <p style="color: #767676; margin-top: 5px;">We're sorry, but your booking request could not be confirmed</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #4D484D;">Booking Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.listingTitle}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Host:</p>
              <p style="margin: 5px 0 0; color: #767676;">${bookingData.providerName}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Dates:</p>
              <p style="margin: 5px 0 0; color: #767676;">Check-in: ${checkInDate}</p>
              <p style="margin: 5px 0 0; color: #767676;">Check-out: ${checkOutDate}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Guests:</p>
              <p style="margin: 5px 0 0; color: #767676;">
                ${bookingData.capacity.people} ${bookingData.capacity.people > 1 ? 'people' : 'person'}, 
                ${bookingData.capacity.dogs} ${bookingData.capacity.dogs > 1 ? 'dogs' : 'dog'}
              </p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #fff5f5; border-left: 4px solid #e53e3e;">
            <h4 style="margin-top: 0; color: #c53030;">Booking Not Available</h4>
            <p style="margin-bottom: 0; color: #4a5568;">
              Unfortunately, the property is not available for your requested dates. The host may have other commitments or the property could be undergoing maintenance.
            </p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #f0f7ff; border-left: 4px solid #4299e1;">
            <h4 style="margin-top: 0; color: #2b6cb0;">What's Next?</h4>
            <p style="margin-bottom: 10px; color: #4a5568;">
              We recommend exploring other options for your stay. Waureisen has many other beautiful properties that might suit your needs.
            </p>
            <p style="margin-bottom: 0; color: #4a5568;">
              Any payment holds or authorizations related to this booking will be released shortly.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${searchUrl}" style="display: inline-block; background-color: #B4A481; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Explore Other Properties</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #767676; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>The Waureisen Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking rejection email sent to customer (${customerEmail}). Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending booking rejection email:', error);
    throw new Error('Failed to send booking rejection email');
  }
};

const sendListingApprovalEmail = async (providerEmail, listingData) => {
  try {
    const providerListingsUrl = process.env.PROVIDER_LISTINGS_URL || 'http://localhost:5173/provider/your-listings';
    
    // Format the price nicely
    const formattedPrice = `${listingData.pricePerNight?.price || 0} ${listingData.pricePerNight?.currency || 'CHF'}`;
    
    // Create HTML content for email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hallo@waureisen.com',
      to: providerEmail,
      subject: 'Waureisen - Your Listing Has Been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #B4A481; margin: 0;">Listing Approved!</h2>
            <p style="color: #767676; margin-top: 5px;">Your property listing is now active on Waureisen</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #4D484D;">Listing Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.title || 'Your Property'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Location:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.location?.address || 'Address pending'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Price:</p>
              <p style="margin: 5px 0 0; color: #767676;">${formattedPrice} per night</p>
            </div>
            
            <div>
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Status:</p>
              <p style="margin: 5px 0 0; color: #767676;">Active</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #f0f7ff; border-left: 4px solid #4299e1;">
            <h4 style="margin-top: 0; color: #2b6cb0;">What's Next?</h4>
            <p style="margin-bottom: 10px; color: #4a5568;">
              Your listing is now approved and visible to potential customers. You'll receive booking notifications via email when customers book your property.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${providerListingsUrl}" style="display: inline-block; background-color: #B4A481; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Go to Listings</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #767676; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>The Waureisen Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Listing approval email sent to provider (${providerEmail}). Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending listing approval email:', error);
    throw new Error('Failed to send listing approval email');
  }
};

// Send listing creation notification to admin
const sendListingCreationNotificationToAdmin = async (listingData) => {
  try {
    // Get admin email from environment variable
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'hamzashahid0308@gmail.com';
    const providerListingsUrl = process.env.ADMIN_LISTINGS_URL || 'http://localhost:5173/admin/accommodations';
    
    // Format the price nicely
    const formattedPrice = `${listingData.pricePerNight?.price || 0} ${listingData.pricePerNight?.currency || 'CHF'}`;
    
    // Get provider info if available
    const providerName = listingData.owner?.firstName && listingData.owner?.lastName ? 
      `${listingData.owner.firstName} ${listingData.owner.lastName}` : 
      'A provider';
    
    const providerEmail = listingData.owner?.email || 'No email provided';
    
    // Create HTML content for admin email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hallo@waureisen.com',
      to: adminEmail,
      subject: 'Waureisen - New Listing Created [Admin Notification]',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #B4A481; margin: 0;">New Listing Created</h2>
            <p style="color: #767676; margin-top: 5px;">${providerName} has created a new property listing</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #4D484D;">Listing Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Provider:</p>
              <p style="margin: 5px 0 0; color: #767676;">${providerName}</p>
              <p style="margin: 5px 0 0; color: #767676;">${providerEmail}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Property:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.title || 'Unnamed Property'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Location:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.location?.address || 'Address pending'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Price:</p>
              <p style="margin: 5px 0 0; color: #767676;">${formattedPrice} per night</p>
            </div>
            
            <div>
              <p style="margin: 0; font-weight: bold; color: #4D484D;">Status:</p>
              <p style="margin: 5px 0 0; color: #767676;">${listingData.status || 'pending approval'}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #f0f7ff; border-left: 4px solid #4299e1;">
            <h4 style="margin-top: 0; color: #2b6cb0;">Action Required</h4>
            <p style="margin-bottom: 10px; color: #4a5568;">
              This listing requires review and approval before it becomes visible to customers.
              Please review the listing details and approve or reject as appropriate.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${providerListingsUrl}" style="display: inline-block; background-color: #B4A481; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Review Listings</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #767676; font-size: 14px;">
            <p>This is an automated notification from the Waureisen system.</p>
            <p>Best regards,<br/>The Waureisen Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Admin notification email sent for new listing. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
};

module.exports = {
  createVerificationCode,
  verifyCode,
  sendBookingNotificationToProvider,
  sendBookingAcceptanceToCustomer,
  sendBookingRejectionToCustomer,
  sendListingCreationConfirmationEmail,
  sendListingApprovalEmail,
  sendListingCreationNotificationToAdmin
};