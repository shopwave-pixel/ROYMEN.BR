import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

/**
 * @desc    Get active user's saved wishlist catalog items
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug SKU price discountPrice images stock'
    });

    if (!wishlist) {
      // Lazy-initialization of wishlist records
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a product to wishlist securely (prevents duplicate mappings)
 * @route   POST /api/v1/wishlist/add
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('productId payload parameter is mandatory.');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Requested catalog item is unavailable.');
    }

    // Try finding wishlist or create one
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Strictly enforce duplicate checks
    if (wishlist.products.includes(productId)) {
      res.status(400);
      throw new Error('This product is already present in your active Wishlist.');
    }

    wishlist.products.push(productId);
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug SKU price discountPrice images stock'
    });

    res.status(200).json({
      success: true,
      message: 'Product mapped to Wishlist successfully.',
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an asset from active user wishlist catalog
 * @route   POST /api/v1/wishlist/remove
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Mandatory identifier parameter [productId] is required.');
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      res.status(404);
      throw new Error('Your active wishlist record does not exist.');
    }

    const originalCount = wishlist.products.length;
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);

    if (wishlist.products.length === originalCount) {
      res.status(404);
      throw new Error('Product not found in Wishlist.');
    }

    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug SKU price discountPrice images stock'
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlists successfully.',
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
