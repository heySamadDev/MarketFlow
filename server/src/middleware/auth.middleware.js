const ApiError = require("../utils/ApiError");
const sessionRepository = require("../repositories/session.repository");

const authMiddleware = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    throw new ApiError(401, "Authentication required");
  }

  const session = await sessionRepository.findSession(sessionId);
  if (!session) {
    throw new ApiError(401, "Authentication required");
  }

  req.userId = session.userId;

  next();
};

module.exports = authMiddleware;
