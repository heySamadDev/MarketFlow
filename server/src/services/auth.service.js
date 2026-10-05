const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");

const register = async ({ name, email, password }) => {
  const user = await userRepository.findByEmail(email);

  if (user) {
    throw new ApiError(409, "User already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await userRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  const { password: _, ...safeUser } = result.toObject();

  return safeUser;
};

module.exports = {
  register,
};
