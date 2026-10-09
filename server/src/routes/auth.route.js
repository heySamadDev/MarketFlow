const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/auth.validation");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/register",
  validateRegister,
  asyncHandler(authController.register),
);
router.post("/login", validateLogin, asyncHandler(authController.login));
router.get("/me", asyncHandler(authMiddleware), authController.me);
router.post("/logout", asyncHandler(authController.logout));
router.post(
  "/logout-all",
  asyncHandler(authMiddleware),
  asyncHandler(authController.logoutAll),
);

module.exports = router;
