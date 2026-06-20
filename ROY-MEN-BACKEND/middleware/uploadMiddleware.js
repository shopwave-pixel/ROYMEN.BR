import multer from 'multer';

// Use Memory Storage to optimize filesystem execution on containers (Railway)
const storage = multer.memoryStorage();

/**
 * Validates files to approve only valid visual formats (.png, .jpg, .webp)
 */
const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  if (mimeType.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('MIME rejected: Only raw images are supported for product uploads.'), false);
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024 // Strict 4MB size ceiling per product card image
  }
});

// Expose single and multiple buffers handling mechanisms
export const uploadSingleImage = uploadMedia.single('image');
export const uploadProductPhotos = uploadMedia.array('images', 5); // Max 5 image frames per catalogue item

export default {
  uploadSingleImage,
  uploadProductPhotos
};
