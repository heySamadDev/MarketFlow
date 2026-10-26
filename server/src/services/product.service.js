const productRepository = require("../repositories/product.repository");
const ApiError = require("../utils/ApiError");
const { uploadImage, deleteImage } = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getProductsBySeller = async (sellerId, query) => {
  const page = query.page === undefined ? DEFAULT_PAGE : Number(query.page);

  const requestedLimit =
    query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "Page must be a positive integer");
  }

  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw new ApiError(400, "Limit must be a positive integer");
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT);

  const { products, totalProducts, productStats } =
    await productRepository.findProductsBySeller(sellerId, page, limit);

  const totalPages = Math.ceil(totalProducts / limit);

  if (totalPages > 0 && page > totalPages) {
    throw new ApiError(400, "Requested page is out of range");
  }

  return {
    products,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
    },
    stats: productStats,
  };
};

const getProductById = async (sellerId, productId) => {
  const product = await productRepository.findProductById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (product.seller.toString() !== sellerId.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to view this product details.",
    );
  }

  return product;
};

const createProduct = async (sellerId, productData, files) => {
  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const uploadedImages = [];

  try {
    for (const file of files) {
      const image = await uploadImage(file.buffer);
      uploadedImages.push(image);
    }

    const images = uploadedImages.map((image, index) => ({
      ...image,
      isMain: index === 0,
    }));

    const product = await productRepository.createProduct({
      ...productData,
      images,
      seller: sellerId,
    });

    return product;
  } catch (error) {
    const cleanupResults = await Promise.allSettled(
      uploadedImages.map((image) =>
        cloudinary.uploader.destroy(image.publicId, {
          resource_type: "image",
        }),
      ),
    );

    const cleanupFailures = cleanupResults.filter(
      (result) => result.status === "rejected",
    );

    if (cleanupFailures.length > 0) {
      console.error(
        "Some Cloudinary images could not be cleaned up:",
        cleanupFailures,
      );
    }

    throw error;
  }
};

const updateProduct = async (sellerId, productId, updatedData) => {
  const product = await productRepository.findProductById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (product.seller.toString() !== sellerId.toString()) {
    throw new ApiError(403, "You are not allowed to update this product.");
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const allowedFields = ["name", "description", "category", "price", "stock"];

  for (const field of Object.keys(updatedData)) {
    if (!allowedFields.includes(field)) {
      throw new ApiError(400, `Field '${field}' is not allowed to be updated`);
    }
  }

  const updatedProduct = await productRepository.updateProductById(
    productId,
    updatedData,
  );

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  return updatedProduct;
};

const deleteProduct = async (sellerId, productId) => {
  const product = await productRepository.findProductById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (product.seller.toString() !== sellerId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this product.");
  }

  const deletionResults = await Promise.allSettled(
    product.images.map((image) => deleteImage(image.publicId)),
  );

  const failedDeletion = deletionResults.filter((item) => {
    if (item.status === "rejected") {
      return true;
    }

    const cloudinaryResult = item.value?.result;

    return cloudinaryResult !== "ok" && cloudinaryResult !== "not found";
  });

  if (failedDeletion.length > 0) {
    console.error("Cloudinary image deletion failures:", failedDeletion);

    throw new ApiError(500, "Failed to delete product images.");
  }

  const deletedProduct = await productRepository.deleteProductById(productId);

  return deletedProduct;
};

module.exports = {
  getProductsBySeller,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
