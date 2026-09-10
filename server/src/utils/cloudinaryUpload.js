const cloudinary = require('../config/cloudinary');

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary folder path
 * @param {string} filename - Original filename
 * @returns {Object} - { url, publicId, thumbnailUrl, width, height }
 */
const uploadToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        eager: [
          { width: 400, height: 400, crop: 'fill', quality: 'auto' },
        ],
        eager_async: true,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          // Build thumbnail URL using Cloudinary transformations
          const thumbnailUrl = cloudinary.url(result.public_id, {
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
          });

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            thumbnailUrl,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
