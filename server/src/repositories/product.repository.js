const Product = require("../models/product.model");
const mongoose = require("mongoose");

const createProduct = async (productData) => {
  return Product.create(productData);
};

const findProductById = async (productId) => {
  return Product.findById(productId);
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const findProductsBySeller = async (sellerId, page, limit, filters = {}) => {
  const skip = (page - 1) * limit;

  const filter = { seller: sellerId };

  const { search, category, stockStatus } = filters;

  if (search) {
    filter.name = {
      $regex: escapeRegex(search),
      $options: "i",
    };
  }

  if (category) {
    filter.category = category;
  }

  if (stockStatus === "inStock") {
    filter.stock = { $gt: 0 };
  } else if (stockStatus === "outOfStock") {
    filter.stock = 0;
  }

  const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

  const [products, filteredProducts, totalProducts, stats] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filter),
    Product.countDocuments({ seller: sellerId }),
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
              $cond: [{ $gt: ["$stock", 0] }, 1, 0],
            },
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }],
                },
                1,
                0,
              ],
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
    filteredProducts,
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
