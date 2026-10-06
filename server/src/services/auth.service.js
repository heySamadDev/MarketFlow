const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const { createSession } = require("../repositories/session.repository");

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

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const sessionId = await createSession(user._id.toString());

  const { password: _, ...safeUser } = user.toObject();

  return { user: safeUser, sessionId };
};

module.exports = {
  register,
  login,
};
