const Product = require("../models/product.model");
const mongoose = require("mongoose");

const createProduct = async (productData) => {
  return Product.create(productData);
};

const findProductById = async (productId) => {
  return Product.findById(productId);
};

const findProductsBySeller = async (sellerId, page, limit) => {
  const skip = (page - 1) * limit;

  const filter = { seller: sellerId };

  const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

  const [products, totalProducts, stats] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
    Product.aggregate([
      {
        $match: {
          seller: sellerObjectId,
        },
      },
      {
        $group: {
          _id: null,

          inStockProducts: {
            $sum: {
              $cond: {
                if: { $gt: ["$stock", 0] },
                then: 1,
                else: 0,
              },
            },
          },
          lowStockProducts: {
            $sum: {
              $cond: {
                if: {
                  $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ]),
  ]);

  const productStats = stats[0]
    ? {
        inStockProducts: stats[0].inStockProducts,
        lowStockProducts: stats[0].lowStockProducts,
      }
    : {
        inStockProducts: 0,
        lowStockProducts: 0,
      };

  return {
    products,
    totalProducts,
    productStats,
  };
};

const updateProductById = (productId, updatedData) => {
  return Product.findByIdAndUpdate(productId, updatedData, {
    new: true,
    runValidators: true,
  });
};

const deleteProductById = (productId) => {
  return Product.findByIdAndDelete(productId);
};

module.exports = {
  createProduct,
  findProductById,
  findProductsBySeller,
  updateProductById,
  deleteProductById,
};
