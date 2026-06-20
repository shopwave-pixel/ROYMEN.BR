import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public routes:
 * Fetch all categories or query one by id
 */
router.get('/', getCategories);
router.get('/:id', getCategoryById);

/**
 * Protected Admin operations:
 * Create, Update, and delete categories
 */
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
