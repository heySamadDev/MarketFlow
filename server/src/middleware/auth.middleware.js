const ApiError = require("../utils/ApiError");
const sessionRepository = require("../repositories/session.repository");
const userRepository = require("../repositories/user.repository");

const authMiddleware = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    throw new ApiError(401, "Authentication required");
  }

  const session = await sessionRepository.findSession(sessionId);
  if (!session) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await userRepository.findById(session.userId);
  if (!user) {
    await sessionRepository.clearSession(sessionId);
    throw new ApiError(401, "Authentication required");
  }

  req.userId = session.userId;
  req.sessionId = sessionId;
  req.csrfToken = session.csrfToken;

  return next();
};

module.exports = authMiddleware;
