import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @desc    Get active user's cart populated with product metadata
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug SKU price discountPrice images stock'
    });

    if (!cart) {
      // Lazy provision empty cart if not already present
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart with validation check (size/color/stock)
 * @route   POST /api/v1/cart/add
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId || !size || !color) {
      res.status(400);
      throw new Error('Product details (productId, size, color) are mandatory fields.');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Product not found or is currently inactive.');
    }

    // Is requested volume available in inventories?
    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Insufficient inventory. Only ${product.stock} units available in stock.`);
    }

    // Validate size specifications if applicable
    if (product.sizes && !product.sizes.includes(size)) {
      res.status(400);
      throw new Error(`Size specification '${size}' is invalid for this model.`);
    }

    // Find user's existing cart or create one
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Use discountPrice if of superior value, otherwise get raw standard unit price
    const unitPrice = product.discountPrice && product.discountPrice < product.price 
      ? product.discountPrice 
      : product.price;

    // Check if item exact match (product + size + color) exists inside the list
    const existingIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingIndex > -1) {
      const prospectiveQuantity = cart.items[existingIndex].quantity + Number(quantity);
      if (product.stock < prospectiveQuantity) {
        res.status(400);
        throw new Error(`Cannot add more. Combined cart quantity exceeds available stock (${product.stock}).`);
      }
      cart.items[existingIndex].quantity = prospectiveQuantity;
      cart.items[existingIndex].price = unitPrice; // Sync with newest rate
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        size,
        color,
        price: unitPrice
      });
    }

    await cart.save();
    
    // Populate before return
    await cart.populate({
      path: 'items.product',
      select: 'name slug SKU price discountPrice images stock'
    });

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item block from active cart
 * @route   POST /api/v1/cart/remove
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId, size, color } = req.body;

    if (!productId || !size || !color) {
      res.status(400);
      throw new Error('Mandatory product signatures (productId, size, color) are absent.');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Your active cart session does not exist.');
    }

    // Filter out item
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => 
      !(item.product.toString() === productId && 
        item.size === size && 
        item.color === color)
    );

    if (cart.items.length === originalLength) {
      res.status(404);
      throw new Error('Matching item block was not found inside your cart.');
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug SKU price discountPrice images stock'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity of specific item in the cart
 * @route   PUT /api/v1/cart/update
 * @access  Private
 */
export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId, size, color, quantity } = req.body;

    if (!productId || !size || !color || quantity === undefined) {
      res.status(400);
      throw new Error('All params (productId, size, color, quantity) are mandatory.');
    }

    const targetQuantity = Number(quantity);
    if (targetQuantity < 1) {
      res.status(400);
      throw new Error('Quantity must evaluate to a non-zero positive integer value.');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found.');
    }

    if (product.stock < targetQuantity) {
      res.status(400);
      throw new Error(`Inventory stock bounds exceeded. Maximum available stock: ${product.stock} units.`);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Your session-bound cart holds no active record.');
    }

    const targetIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (targetIndex === -1) {
      res.status(404);
      throw new Error('Target item block is not present within the cart details.');
    }

    cart.items[targetIndex].quantity = targetQuantity;
    
    // Sync price metadata snapshot
    const unitPrice = product.discountPrice && product.discountPrice < product.price 
      ? product.discountPrice 
      : product.price;
    cart.items[targetIndex].price = unitPrice;

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug SKU price discountPrice images stock'
    });

    res.status(200).json({
      success: true,
      message: 'Cart quantities adjusted successfully.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Completely empty out active cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('No active cart record found to clean.');
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Your cart has been purged successfully.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
};
