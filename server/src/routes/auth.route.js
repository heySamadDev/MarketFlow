const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/auth.validation");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/register",
  validateRegister,
  asyncHandler(authController.register),
);
router.post("/login", validateLogin, asyncHandler(authController.login));

module.exports = router;
