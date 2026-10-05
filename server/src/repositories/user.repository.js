const User = require("../models/user.model");

const findByEmail = async (email) => {
  const user = await User.findOne({ email });

  return user;
};

const create = async (userData) => {
  const result = await User.create(userData);

  return result;
};

module.exports = {
  findByEmail,
  create,
};