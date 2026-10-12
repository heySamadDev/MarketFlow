const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const {
  createSession,
  clearSession,
  clearAllSessions,
  getActiveSessions,
  clearSessionByRecordId,
  clearOtherSession,
} = require("../repositories/session.repository");

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

const logout = async (sessionId) => {
  await clearSession(sessionId);
};

const logoutAll = async (userId) => {
  await clearAllSessions(userId);
};

const getUserSessions = async (userId) => {
  const sessions = await getActiveSessions(userId);

  return sessions.map((session) => ({
    sessionRecordId: session.sessionRecordId,
    createdAt: session.createdAt,
  }));
};

const revokeUserSessions = async (userId, sessionRecordId) => {
  const revoke = await clearSessionByRecordId(userId, sessionRecordId);

  if (!revoke) {
    throw new ApiError(404, "Session not found");
  }

  return true;
};

const revokeOtherUserSessions = async (userId, currentSessionId) => {
  await clearOtherSession(userId, currentSessionId);

  return true;
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  getUserSessions,
  revokeUserSessions,
  revokeOtherUserSessions,
};
