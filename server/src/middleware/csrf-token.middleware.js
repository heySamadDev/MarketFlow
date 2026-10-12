const validateCsrfToken = (req, res, next) => {
  const csrfToken = req.get("X-CSRF-Token");

  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token required",
    });
  }

  if (!req.csrfToken || csrfToken !== req.csrfToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  return next();
};

module.exports = { validateCsrfToken };
