const cookieConfig = require("../config/cookie");
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

  res.cookie("sessionId", result.sessionId, cookieConfig);

  res
    .status(200)
    .json(new ApiResponse("User logged in successfully", result.user));
};

const me = (req, res) => {
  const userId = req.userId;

  res.status(200).json(new ApiResponse("Authorized", userId));
};

const logout = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    await authService.logout(sessionId);
  }

  res.clearCookie("sessionId");

  res.status(200).json(new ApiResponse("User logged out successfully"));
};

const logoutAll = async (req, res) => {
  const userId = req.userId;

  if (userId) {
    await authService.logoutAll(userId);
  }

  res.clearCookie("sessionId");

  res.status(200).json(new ApiResponse("User logged out from all devices"));
};

const getSessions = async (req, res) => {
  const sessions = await authService.getUserSessions(req.userId);

  return res
    .status(200)
    .json(new ApiResponse("Active sessions fetched successfully", sessions));
};

const revokeSession = async (req, res) => {
  const userId = req.userId;
  const sessionRecordId = req.params.sessionRecordId;

  await authService.revokeUserSessions(userId, sessionRecordId);

  return res.status(200).json(new ApiResponse("Session revoked successfully"));
};

const revokeOtherSessions = async (req, res) => {
  await authService.revokeOtherUserSessions(req.userId, req.sessionId);

  res.status(200).json(new ApiResponse("Other sessions revoked successfully"));
};

module.exports = {
  register,
  login,
  me,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
  revokeOtherSessions,
};
