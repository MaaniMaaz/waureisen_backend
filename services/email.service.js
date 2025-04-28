const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Store verification codes with expiration
// In a production environment, consider using Redis instead of in-memory storage
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
      from: process.env.EMAIL_USER,
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
      from: process.env.EMAIL_USER,
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
        from: process.env.EMAIL_USER,
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

// NEW FUNCTION: Send booking rejection notification to customer
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
      from: process.env.EMAIL_USER,
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

module.exports = {
  createVerificationCode,
  verifyCode,
  sendBookingNotificationToProvider,
  sendBookingAcceptanceToCustomer,
  sendBookingRejectionToCustomer
};