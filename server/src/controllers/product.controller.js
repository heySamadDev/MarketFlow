const productService = require("../services/product.service");
const ApiResponse = require("../utils/ApiResponse");

const getProductsBySeller = async (req, res) => {
  const sellerId = req.userId;

  const result = await productService.getProductsBySeller(sellerId, req.query);

  return res
    .status(200)
    .json(new ApiResponse("Product retrieved successfully", result));
};

const createProduct = async (req, res) => {
  const sellerId = req.userId;

  const product = await productService.createProduct(
    sellerId,
    req.body,
    req.files,
  );

  return res
    .status(201)
    .json(new ApiResponse("Product created successfully", product));
};

const updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const sellerId = req.userId;
  const updates = req.body;

  const result = await productService.updateProduct(
    sellerId,
    productId,
    updates,
  );

  return res
    .status(200)
    .json(new ApiResponse("Product updated successfully.", result));
};

const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  const sellerId = req.userId;

  const result = await productService.deleteProduct(sellerId, productId);

  return res
    .status(200)
    .json(new ApiResponse("Product deleted successfully", result));
};

module.exports = {
  getProductsBySeller,
  createProduct,
  updateProduct,
  deleteProduct,
};
