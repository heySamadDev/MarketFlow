const TRUSTED_ORIGIN = "http://localhost:5173";
const STATE_CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

const validateOrigin = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");

  if (origin !== TRUSTED_ORIGIN) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Untrusted origin",
    });
  }

  return next();
};

module.exports = { validateOrigin };
