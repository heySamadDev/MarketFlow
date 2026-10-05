const ApiError = require("../utils/ApiError");

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new ApiError(400, "Name is required and must be a valid string");
  }

  if (
    !email ||
    typeof email !== "string" ||
    email.trim() === "" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new ApiError(400, "Please provide a valid email");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  next();
};

module.exports = {
  validateRegister,
};
