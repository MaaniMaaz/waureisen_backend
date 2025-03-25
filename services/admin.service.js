const Admin = require('../models/admin.model');

exports.getAllAdmins = async () => {
  return await Admin.find();
};

exports.getAdminById = async (id) => {
  return await Admin.findById(id);
};

exports.getAdminByEmail = async (email) => {
  return await Admin.findOne({ email });
};

exports.createAdmin = async (data) => {
  const newAdmin = new Admin(data);
  return await newAdmin.save();
};

exports.updateAdmin = async (id, data) => {
  return await Admin.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteAdmin = async (id) => {
  await Admin.findByIdAndDelete(id);
};
