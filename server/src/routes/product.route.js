const express = require("express");
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateProduct = require("../middleware/product.validate");
const uploadProductImages = require("../middleware/upload.middleware");
const asyncHandler = require("../utils/asyncHandler");
const validateProductUpdate = require("../middleware/productUpdate.validate");

const router = express.Router();

router.get("/", authMiddleware, productController.getProductsBySeller);

router.get(
  "/:productId",
  authMiddleware,
  asyncHandler(productController.getProductById),
);

router.post(
  "/",
  authMiddleware,
  uploadProductImages.array("images", 5),
  validateProduct,
  asyncHandler(productController.createProduct),
);

router.patch(
  "/:productId",
  authMiddleware,
  validateProductUpdate,
  asyncHandler(productController.updateProduct),
);

router.delete(
  "/:productId",
  authMiddleware,
  asyncHandler(productController.deleteProduct),
);

module.exports = router;
