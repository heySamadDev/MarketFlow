const express = require("express");
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateProduct = require("../middleware/product.validate");
const uploadProductImages = require("../middleware/upload.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authMiddleware, productController.getProductsBySeller);

router.post(
  "/",
  authMiddleware,
  uploadProductImages.array("images", 5),
  validateProduct,
  asyncHandler(productController.createProduct),
);

module.exports = router;
