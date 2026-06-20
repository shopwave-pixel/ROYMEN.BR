import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProductPhotos } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * Public Routes:
 * Browsing catalogues and single items
 */
router.get('/', getProducts);
router.get('/:id', getProductById);

/**
 * Protected Admin-Only Routes:
 * Adding, editing, and wiping product entries using multipart handlers
 */
router.post('/', protect, authorize('admin'), uploadProductPhotos, createProduct);
router.put('/:id', protect, authorize('admin'), uploadProductPhotos, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
