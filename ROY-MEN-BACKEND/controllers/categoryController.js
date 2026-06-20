import Category from '../models/Category.js';

/**
 * @desc    Create a new product Category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Category name is mandatory.');
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('A category with this name already exists.');
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories list (supports active-only filtering optionally)
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active === 'true') {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single category details
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category resource not found.');
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing Category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category resource lookup failed.');
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category details updated successfully.',
      category: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category resource not found.');
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: `Category '${category.name}' removed successfully.`
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
