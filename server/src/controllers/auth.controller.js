const authService = require("../services/auth.service");

const register = async (req, res) => {
  const userData = req.body;

  const result = await authService.register(userData);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

module.exports = {
  register,
};
