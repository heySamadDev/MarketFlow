const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Each image must be 5 MB or smaller.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "You can upload a maximum of 5 images.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected image field or too many images.";
    } else {
      message = "Invalid image upload.";
    }
  } else if (err.statusCode >= 500 || !err.statusCode) {
    statusCode = 500;
    message = "Internal server error";
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
