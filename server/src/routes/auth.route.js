const express = require("express");
const authController = require("../controllers/auth.controller");
const { validateRegister } = require("../middleware/auth.validation");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/register",
  validateRegister,
  asyncHandler(authController.register),
);

module.exports = router;
