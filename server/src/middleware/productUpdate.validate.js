const validateProductUpdate = (req, res, next) => {
  const updates = req.body;

  const isPlainObject =
    updates !== null &&
    typeof updates === "object" &&
    !Array.isArray(updates) &&
    Object.getPrototypeOf(updates) === Object.prototype;

  if (!isPlainObject || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update.",
    });
  }

  next();
};

module.exports = validateProductUpdate;
