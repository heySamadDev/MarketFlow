const productRepository = require("../repositories/product.repository");
const ApiError = require("../utils/ApiError");
const { uploadImage } = require("../utils/cloudinaryUpload");
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

  const { products, totalProducts } =
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
  };
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

module.exports = {
  getProductsBySeller,
  createProduct,
};
