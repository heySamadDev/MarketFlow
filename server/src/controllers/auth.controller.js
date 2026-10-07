const authService = require("../services/auth.service");
const ApiResponse = require("../utils/ApiResponse");

const register = async (req, res) => {
  const userData = req.body;

  const result = await authService.register(userData);

  res.status(201).json(new ApiResponse("User registered successfully", result));
};

const login = async (req, res) => {
  const userData = req.body;

  const result = await authService.login(userData);

  res.cookie("sessionId", result.sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 1000,
  });

  res
    .status(200)
    .json(new ApiResponse("User logged in successfully", result.user));
};

const me = (req, res) => {
  const userId = req.userId;

  res.status(200).json(new ApiResponse("Authorized", userId));
}

const logout = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if(sessionId){
    await authService.logout(sessionId);
  }

  res.clearCookie("sessionId");

  res.status(200).json(new ApiResponse("User logged out successfully"));
}

module.exports = {
  register,
  login,
  me,
  logout
};
