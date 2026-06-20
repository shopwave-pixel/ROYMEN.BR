import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a file buffer directly to Cloudinary using image pools/streams
 * @param {Buffer} fileBuffer - The image raw buffer payload from multer
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{secureUrl: string, publicId: string}>}
 */
export const uploadImageToCloudinary = async (fileBuffer, folder = 'roy-men-products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good',
        transformation: [{ width: 1000, height: 1250, crop: 'fill', gravity: 'north' }] // 4:5 precise fashion crop bounds
      },
      (error, result) => {
        if (error) return reject(new Error(`Cloudinary uploading malfunction: ${error.message}`));
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Removes an image asset from Cloudinary using publicId tracking
 * @param {string} publicId - The unique Cloudinary asset public ID
 * @returns {Promise<any>}
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary asset purge error: ${error.message}`);
  }
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary
};
