const authService = require("../services/auth.service");
const ApiResponse = require("../utils/ApiResponse");

const register = async (req, res) => {
  const userData = req.body;

  const result = await authService.register(userData);

  res.status(201).json(new ApiResponse("User registered successfully", result));
};

module.exports = {
  register,
};
