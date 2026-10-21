const cloudinary = require("../config/cloudinary");

function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "marketflow/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject("Cloudinary returned no upload result.");
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );
    uploadStream.end(buffer);
  });
}

async function deleteImage(publicId) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

module.exports = { uploadImage, deleteImage };
