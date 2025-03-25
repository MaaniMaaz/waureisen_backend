const adminService = require('../services/admin.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      return res.status(404).json({ message: 'Admin not found' });
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
    const updatedAdmin = await adminService.updateAdmin(req.params.id, req.body);
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
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
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const adminData = {
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    };

    const newAdmin = await adminService.createAdmin(adminData);

    // Generate token
    const token = jwt.sign(
      { id: newAdmin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      }
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    next(err);
  }
};
