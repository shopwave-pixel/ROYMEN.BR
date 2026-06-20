import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../services/cloudinaryService.js';

/**
 * @desc    Get all products with filtration, pagination, and sorting
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // 1. Filter by Active status for clients (Admin can query inactive as well)
    if (req.user?.role !== 'admin') {
      query.isActive = true;
    }

    // 2. Textual search query across Name & Description indices
    if (search) {
      query.$text = { $search: search };
    }

    // 3. Category filtering
    if (category) {
      // Allow category query by dynamic slug or ID reference
      const categoryDoc = await Category.findOne({
        $or: [
          { name: category },
          { slug: category },
          { _id: typeof category === 'string' && category.match(/^[0-9a-fA-F]{24}$/) ? category : undefined }
        ].filter(Boolean)
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Return blank values instead of querying mismatch docs
        query.category = null;
      }
    }

    // 4. Custom range price filtration
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Featured flags bounds
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // 6. Pagination offset and limits computation
    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const sizePerPage = Number(limit) > 0 ? Number(limit) : 12;
    const skipAmount = (currentPage - 1) * sizePerPage;

    // 7. Choose sorting configurations
    let sortOptions = { createdAt: -1 }; // default: newest first
    if (sort) {
      if (sort === 'priceAsc') sortOptions = { price: 1 };
      if (sort === 'priceDesc') sortOptions = { price: -1 };
      if (sort === 'bestSelling') sortOptions = { stock: 1 }; // lower stock/high movement estimation
    }

    // Execute queries
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(sizePerPage);

    const totalProductsCount = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        totalItems: totalProductsCount,
        totalPages: Math.ceil(totalProductsCount / sizePerPage),
        currentPage,
        limit: sizePerPage
      },
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single product description details by id/slug
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne(
      isObjectId ? { _id: req.params.id } : { slug: req.params.id }
    ).populate('category', 'name slug');

    if (!product) {
      res.status(404);
      throw new Error(`Product lookup target of id/slug '${req.params.id}' is absent.`);
    }

    // Increment view counter dynamically (doesn't block the client response block)
    product.views = (product.views || 0) + 1;
    await product.save().catch(err => console.error('[VIEWS_TRACKER] Failed to increment views:', err.message));

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product with modern CDN attachments handling
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      price,
      discountPrice,
      category,
      sizes,
      colors,
      stock,
      isFeatured
    } = req.body;

    // Manual payload validation checks
    if (!name || !sku || !price || !category) {
      res.status(400);
      throw new Error('Please supply all required product blueprint parameters (name, sku, price, category).');
    }

    // SKU verification
    const skuConflict = await Product.findOne({ sku });
    if (skuConflict) {
      res.status(400);
      throw new Error(`The target stock SKU descriptor '${sku}' already represents a registered product catalog.`);
    }

    // Validate category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      res.status(400);
      throw new Error('Target category does not exist.');
    }

    const imagesToSave = [];

    // Process files uploaded in buffer stream mode
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImageToCloudinary(file.buffer, 'roy-men-catalogue');
        imagesToSave.push({
          secureUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId
        });
      }
    }

    const newProduct = await Product.create({
      name,
      sku,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      images: imagesToSave,
      sizes: sizes ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes) : undefined,
      colors: colors ? (typeof colors === 'string' ? JSON.parse(colors) : colors) : undefined,
      stock: stock ? Number(stock) : undefined,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    res.status(201).json({
      success: true,
      message: 'ROY MEN Premium Catalog item entered successfully.',
      product: newProduct
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update highly secure details & Stock volumes on active items
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Requested catalog item details lookup failed.');
    }

    const {
      name,
      sku,
      description,
      price,
      discountPrice,
      category,
      sizes,
      colors,
      stock,
      isFeatured,
      isActive,
      purgeImages // parsed JSON array of publicIds to be removed from Cloudinary
    } = req.body;

    // 1. Remove targeted old images from Cloudinary storage
    let currentImages = [...product.images];
    if (purgeImages) {
      const purgeList = typeof purgeImages === 'string' ? JSON.parse(purgeImages) : purgeImages;
      if (Array.isArray(purgeList) && purgeList.length > 0) {
        for (const pubId of purgeList) {
          await deleteImageFromCloudinary(pubId);
          currentImages = currentImages.filter(img => img.publicId !== pubId);
        }
      }
    }

    // 2. Append newly uploaded images to the database references list
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImageToCloudinary(file.buffer, 'roy-men-catalogue');
        currentImages.push({
          secureUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId
        });
      }
    }

    // Validate category changes if present
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        res.status(400);
        throw new Error('Supplied category updates does not represent an active ID entry.');
      }
      product.category = category;
    }

    // Apply updates gracefully
    if (name) product.name = name;
    if (sku) product.sku = sku;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (sizes) product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    if (colors) product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    if (stock !== undefined) product.stock = Number(stock);
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

    product.images = currentImages;

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'ROY MEN Product profile updated successfully.',
      product: updatedProduct
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Completely eliminate product profile along with assets from CDN
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Catalogs reference target not found.');
    }

    // Destroy every picture asset registered in Cloudinary for this product
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        try {
          await deleteImageFromCloudinary(img.publicId);
        } catch (cdnErr) {
          console.error(`[CDN_ERROR] Bypassed error purging asset ${img.publicId}:`, cdnErr.message);
        }
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: `Product catalog code [${product.sku}] removed successfully.`
    });

  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
