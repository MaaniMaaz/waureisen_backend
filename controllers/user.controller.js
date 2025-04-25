const userService = require("../services/user.service");
const bookingService = require("../services/booking.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const newsletterService = require("../services/newsletter.service");

// Add these new methods at the beginning of the file
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, phoneNumber, firstName, lastName } =
      req.body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await userService.createUser({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      firstName,
      lastName,
      terms: ["default_terms"], // Required field as per model
      profileStatus: "not verified",
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is banned
    if (user.profileStatus === "banned") {
      return res.status(403).json({
        message:
          "Your account has been banned. Please contact support for assistance.",
        isBanned: true,
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileStatus: user.profileStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const status = req.headers["profile-status"]?.toLowerCase() || "banned";
    if (
      !["not verified", "pending verification", "verified", "banned"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedUser = await userService.updateUser(req.params.id, {
      profileStatus: status,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getUserTrips = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const userId = req.user.id;

    const [upcomingTrips, pastTrips] = await Promise.all([
      bookingService.getBookingsByUserAndDateRange(
        userId,
        currentDate,
        "upcoming"
      ),
      bookingService.getBookingsByUserAndDateRange(userId, currentDate, "past"),
    ]);

    res.json({
      upcoming: upcomingTrips,
      past: pastTrips,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFavoriteListings = async (req, res, next) => {
  try {
    const favorites = await userService.getUserFavorites(req.user.id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};

exports.addToFavorites = async (req, res, next) => {
  try {
    const updated = await userService.addToFavorites(
      req.user.id,
      req.params.listingId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.removeFromFavorites = async (req, res, next) => {
  try {
    const updated = await userService.removeFromFavorites(
      req.user.id,
      req.params.listingId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.getReviewedBookings = async (req, res, next) => {
  try {
    const reviewedBookings = await bookingService.getReviewedBookings(
      req.user.id
    );
    res.json(reviewedBookings);
  } catch (err) {
    next(err);
  }
};

exports.subscribeToNewsletter = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.addSubscriber(
      req.params.newsletterId,
      req.user.id
    );
    res.json(newsletter);
  } catch (err) {
    next(err);
  }
};

exports.unsubscribeFromNewsletter = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.removeSubscriber(
      req.params.newsletterId,
      req.user.id
    );
    res.json(newsletter);
  } catch (err) {
    next(err);
  }
};

exports.getNewsletterSubscriptions = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.find({ subscribers: req.user.id });
    res.json(newsletters);
  } catch (err) {
    next(err);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Use the existing service to get the user by ID
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Generate a customer number if one doesn't exist
    if (!user.customerNumber) {
      // Format: WAU-YYYY-XXXXX where YYYY is current year and XXXXX is a random 5-digit number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
      const customerNumber = `WAU-${year}-${randomNum}`;

      // Update the user with the new customer number
      user.customerNumber = customerNumber;
      await user.save();
      console.log(
        `Generated new customer number ${customerNumber} for user ${userId}`
      );
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    next(err);
  }
};

// Add or update this controller method
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // console.log('Updating profile for user:', userId);
    // console.log('Update data received:', req.body);

    // Use the existing service to update the user
    const updatedUser = await userService.updateUser(userId, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user profile:", err);
    next(err);
  }
};

// Recently Viewed controller methods
exports.getRecentlyViewedListings = async (req, res, next) => {
  try {
    const recentlyViewed = await userService.getRecentlyViewed(req.user.id);
    res.json(recentlyViewed);
  } catch (err) {
    next(err);
  }
};

exports.addToRecentlyViewed = async (req, res, next) => {
  try {
    const updated = await userService.addToRecentlyViewed(
      req.user.id,
      req.params.listingId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.removeFromRecentlyViewed = async (req, res, next) => {
  try {
    const updated = await userService.removeFromRecentlyViewed(
      req.user.id,
      req.params.listingId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
