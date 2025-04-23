const adminService = require("../services/admin.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  } catch (err) {
    next(err);
  }
};

exports.getAdminById = async (req, res, next) => {
  try {
    const admin = await adminService.getAdminById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (err) {
    next(err);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const newAdmin = await adminService.createAdmin(req.body);
    res.status(201).json(newAdmin);
  } catch (err) {
    next(err);
  }
};

exports.updateAdmin = async (req, res, next) => {
  try {
    const updatedAdmin = await adminService.updateAdmin(
      req.params.id,
      req.body
    );
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(updatedAdmin);
  } catch (err) {
    next(err);
  }
};

exports.deleteAdmin = async (req, res, next) => {
  try {
    await adminService.deleteAdmin(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await adminService.getAdminByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const adminData = {
      username,
      email,
      password: hashedPassword,
      role: "admin",
    };

    const newAdmin = await adminService.createAdmin(adminData);

    // Generate token
    const token = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await adminService.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Add these functions to your existing admin controller

// Get recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    // Use req.user.id from auth token instead of path parameter
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Use MongoDB's native driver to fetch admin
      const adminData = await Admin.collection.findOne({
        _id: new mongoose.Types.ObjectId(adminId),
      });

      if (!adminData) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Manually populate the recommendations using findById for each listing
      let topRecommendations = [];
      let popularAccommodations = [];
      let exclusiveFinds = [];

      if (
        adminData.topRecommendations &&
        Array.isArray(adminData.topRecommendations)
      ) {
        const topPromises = adminData.topRecommendations.map((id) =>
          Listing.findById(id).catch((err) => {
            console.warn(`Error finding listing ${id}:`, err.message);
            return null;
          })
        );
        topRecommendations = (await Promise.all(topPromises)).filter(Boolean);
      }

      if (
        adminData.popularAccommodations &&
        Array.isArray(adminData.popularAccommodations)
      ) {
        const popularPromises = adminData.popularAccommodations.map((id) =>
          Listing.findById(id).catch((err) => {
            console.warn(`Error finding listing ${id}:`, err.message);
            return null;
          })
        );
        popularAccommodations = (await Promise.all(popularPromises)).filter(
          Boolean
        );
      }

      if (adminData.exclusiveFinds && Array.isArray(adminData.exclusiveFinds)) {
        const exclusivePromises = adminData.exclusiveFinds.map((id) =>
          Listing.findById(id).catch((err) => {
            console.warn(`Error finding listing ${id}:`, err.message);
            return null;
          })
        );
        exclusiveFinds = (await Promise.all(exclusivePromises)).filter(Boolean);
      }

      // Return processed recommendations, filtering out invalid listings
      res.json({
        topRecommendations,
        popularAccommodations,
        exclusiveFinds,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Return empty data even on error to avoid breaking the frontend
      res.json({
        topRecommendations: [],
        popularAccommodations: [],
        exclusiveFinds: [],
      });
    }
  } catch (err) {
    console.error("Error in getRecommendations:", err);
    // Return empty data even on error to avoid breaking the frontend
    res.json({
      topRecommendations: [],
      popularAccommodations: [],
      exclusiveFinds: [],
    });
  }
};

// Update top recommendations
exports.updateTopRecommendations = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { listingIds } = req.body;

    // Validate input
    if (!Array.isArray(listingIds)) {
      return res.status(400).json({
        message: "Invalid input. Please provide an array of listing IDs.",
      });
    }

    // Enforce the limit of 6 items in the array
    const limitedIds = listingIds.slice(0, 6);

    // Verify all listings exist
    const validIds = [];
    for (const id of limitedIds) {
      try {
        const listing = await Listing.findById(id);
        if (listing) {
          validIds.push(new mongoose.Types.ObjectId(id));
        } else {
          console.warn(`Listing with ID ${id} not found, skipping`);
        }
      } catch (err) {
        console.warn(`Invalid listing ID: ${id}, skipping`);
      }
    }

    // Only use valid IDs and limit to 6
    const finalIds = validIds.slice(0, 6);

    try {
      // Use native MongoDB driver to completely bypass Mongoose validation
      const result = await Admin.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(adminId) },
        { $set: { topRecommendations: finalIds } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Get the updated admin document
      const admin = await Admin.findById(adminId).populate(
        "topRecommendations"
      );

      res.json({
        topRecommendations: admin.topRecommendations,
        message: "Top recommendations updated successfully",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: "Database operation failed",
        error: dbError.message,
      });
    }
  } catch (err) {
    console.error("Error updating top recommendations:", err);
    res.status(500).json({
      message: "Error updating recommendations",
      error: err.message,
    });
  }
};

// Update popular accommodations
exports.updatePopularAccommodations = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { listingIds } = req.body;

    // Validate input
    if (!Array.isArray(listingIds)) {
      return res.status(400).json({
        message: "Invalid input. Please provide an array of listing IDs.",
      });
    }

    // Enforce the limit of 6 items in the array
    const limitedIds = listingIds.slice(0, 6);

    // Verify all listings exist
    const validIds = [];
    for (const id of limitedIds) {
      try {
        const listing = await Listing.findById(id);
        if (listing) {
          validIds.push(new mongoose.Types.ObjectId(id));
        } else {
          console.warn(`Listing with ID ${id} not found, skipping`);
        }
      } catch (err) {
        console.warn(`Invalid listing ID: ${id}, skipping`);
      }
    }

    // Only use valid IDs and limit to 6
    const finalIds = validIds.slice(0, 6);

    try {
      // Use native MongoDB driver to completely bypass Mongoose validation
      const result = await Admin.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(adminId) },
        { $set: { popularAccommodations: finalIds } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Get the updated admin document
      const admin = await Admin.findById(adminId).populate(
        "popularAccommodations"
      );

      res.json({
        popularAccommodations: admin.popularAccommodations,
        message: "Popular accommodations updated successfully",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: "Database operation failed",
        error: dbError.message,
      });
    }
  } catch (err) {
    console.error("Error updating popular accommodations:", err);
    res.status(500).json({
      message: "Error updating recommendations",
      error: err.message,
    });
  }
};

// Update exclusive finds
exports.updateExclusiveFinds = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { listingIds } = req.body;

    // Validate input
    if (!Array.isArray(listingIds)) {
      return res.status(400).json({
        message: "Invalid input. Please provide an array of listing IDs.",
      });
    }

    // Enforce the limit of 6 items in the array
    const limitedIds = listingIds.slice(0, 6);

    // Verify all listings exist
    const validIds = [];
    for (const id of limitedIds) {
      try {
        const listing = await Listing.findById(id);
        if (listing) {
          validIds.push(new mongoose.Types.ObjectId(id));
        } else {
          console.warn(`Listing with ID ${id} not found, skipping`);
        }
      } catch (err) {
        console.warn(`Invalid listing ID: ${id}, skipping`);
      }
    }

    // Only use valid IDs and limit to 6
    const finalIds = validIds.slice(0, 6);

    try {
      // Use native MongoDB driver to completely bypass Mongoose validation
      const result = await Admin.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(adminId) },
        { $set: { exclusiveFinds: finalIds } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Get the updated admin document
      const admin = await Admin.findById(adminId).populate("exclusiveFinds");

      res.json({
        exclusiveFinds: admin.exclusiveFinds,
        message: "Exclusive finds updated successfully",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: "Database operation failed",
        error: dbError.message,
      });
    }
  } catch (err) {
    console.error("Error updating exclusive finds:", err);
    res.status(500).json({
      message: "Error updating recommendations",
      error: err.message,
    });
  }
};

// Don't forget to add the Listing model import at the top
const Admin = require("../models/admin.model");
const Listing = require("../models/listing.model");
