const Product = require("../models/product.model");

const createProduct = async (productData) => {
  return Product.create(productData);
};

const findProductById = async (productId) => {
  return Product.findById(productId);
};

const findProductsBySeller = async (sellerId, page, limit) => {
  const skip = (page - 1) * limit;

  const filter = { seller: sellerId };

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .sort({ createAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    totalProducts,
  };
};

module.exports = {
  createProduct,
  findProductById,
  findProductsBySeller,
};
