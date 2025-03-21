const adminService = require('../services/admin.service');

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
