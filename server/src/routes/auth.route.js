const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/auth.validation");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const { validateCsrfToken } = require("../middleware/csrf-token.middleware");

const router = express.Router();

router.post(
  "/register",
  validateRegister,
  asyncHandler(authController.register),
);
router.post("/login", validateLogin, asyncHandler(authController.login));
router.get("/me", asyncHandler(authMiddleware), authController.me);
router.post(
  "/logout",
  asyncHandler(authController.logout),
);
router.post(
  "/logout-all",
  asyncHandler(authMiddleware),
  validateCsrfToken,
  asyncHandler(authController.logoutAll),
);
router.get(
  "/sessions",
  asyncHandler(authMiddleware),
  asyncHandler(authController.getSessions),
);
router.delete(
  "/sessions/:sessionRecordId",
  asyncHandler(authMiddleware),
  validateCsrfToken,
  asyncHandler(authController.revokeSession),
);
router.post(
  "/sessions/revoke-others",
  asyncHandler(authMiddleware),
  validateCsrfToken,
  asyncHandler(authController.revokeOtherSessions),
);
router.get(
  "/csrf-token",
  asyncHandler(authMiddleware),
  asyncHandler(authController.getCsrfToken),
);

module.exports = router;
