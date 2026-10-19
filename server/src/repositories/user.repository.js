const User = require("../models/user.model");

const findByEmail = async (email) => {
  const user = User.findOne({ email });

  return user;
};

const findById = async (userId) => {
  return User.findById(userId);
};

const create = async (userData) => {
  const result = User.create(userData);

  return result;
};

module.exports = {
  findByEmail,
  create,
  findById,
};
