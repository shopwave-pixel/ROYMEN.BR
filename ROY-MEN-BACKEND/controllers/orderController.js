import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Create a new customer order from active Cart contents
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, phone, paymentMethod, transactionId, senderPhone, shippingPrice = 60 } = req.body;

    if (!shippingAddress || !phone || !paymentMethod) {
      res.status(400);
      throw new Error('Mandatory ordering credentials (shippingAddress, phone, paymentMethod) are absent.');
    }

    // 1. Fetch user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Cannot write orders. Your active shopping cart contains zero items.');
    }

    // 2. Map and Validate stock + availability for every cart item entry
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        res.status(404);
        throw new Error(`Product model '${item.product}' does not exist or has been deactivated.`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient inventory for item "${product.name}". Stocks available: ${product.stock} units.`);
      }

      orderItems.push({
        product: item.product,
        name: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price
      });
    }

    // 3. Formulate raw order pricing total calculations
    const itemsTotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const calculatedGrandTotal = itemsTotal + Number(shippingPrice);

    // 4. Create base Order record
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      phone,
      paymentMethod,
      shippingPrice: Number(shippingPrice),
      totalPrice: calculatedGrandTotal
    });

    const savedOrder = await order.save();

    // 5. Decrement corresponding stock inventories
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 6. Handle associated Payment record logic
    let createdPayment = null;
    if (['bKash', 'Nagad'].includes(paymentMethod)) {
      if (!transactionId || !senderPhone) {
        // Rollback stocks and order if validation fails
        for (const item of orderItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        await savedOrder.deleteOne();
        res.status(400);
        throw new Error('Transaction ID and Sender Phone numbers are mandatory for bKash or Nagad payments.');
      }

      createdPayment = await Payment.create({
        user: req.user._id,
        order: savedOrder._id,
        paymentMethod,
        amount: calculatedGrandTotal,
        transactionId,
        senderPhone,
        paymentStatus: 'Pending' // Requires Administrative audit
      });

      savedOrder.payment = createdPayment._id;
      await savedOrder.save();
    } else if (paymentMethod === 'COD') {
      // Create empty Pending Payment index trace for COD
      createdPayment = await Payment.create({
        user: req.user._id,
        order: savedOrder._id,
        paymentMethod,
        amount: calculatedGrandTotal,
        paymentStatus: 'Pending'
      });

      savedOrder.payment = createdPayment._id;
      await savedOrder.save();
    }

    // 7. Clear the user shopping Cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'ROY MEN order written successfully.',
      order: savedOrder,
      payment: createdPayment
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed single order records by ID with user metadata populates
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('payment')
      .populate('orderItems.product', 'images slug SKU');

    if (!order) {
      res.status(404);
      throw new Error('Order snapshot details lookup failed.');
    }

    // Auth validation check: Owner or Admin permissions clearance required
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Access Forbidden: Selected profile lacks clearance to view this order.');
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active authorized user order summaries
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.orderStatus = status;

    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const sizePerPage = Number(limit) > 0 ? Number(limit) : 10;
    const skipAmount = (currentPage - 1) * sizePerPage;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(sizePerPage);

    const totalOrdersCount = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        totalItems: totalOrdersCount,
        totalPages: Math.ceil(totalOrdersCount / sizePerPage),
        currentPage,
        limit: sizePerPage
      },
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ALL orders across ecosystem with sorting, lookup, and classification filters
 * @route   GET /api/v1/orders/admin
 * @access  Private/Admin
 */
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.orderStatus = status;

    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const sizePerPage = Number(limit) > 0 ? Number(limit) : 20;
    const skipAmount = (currentPage - 1) * sizePerPage;

    // Optional pipeline to support user filter triggers
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(sizePerPage);

    const totalOrdersCount = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        totalItems: totalOrdersCount,
        totalPages: Math.ceil(totalOrdersCount / sizePerPage),
        currentPage,
        limit: sizePerPage
      },
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Client cancellation workflow for unprocessed transactions (reverts stock allocations)
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order registry not found to cancel.');
    }

    // Only the order placement user may execute client cancellations
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized operational call.');
    }

    // Standard client bounds restrictions: can only drop 'Pending' orders
    if (req.user.role !== 'admin' && order.orderStatus !== 'Pending') {
      res.status(400);
      throw new Error('Cancelled requests are denied on processed catalog distributions.');
    }

    if (['Cancelled', 'Delivered'].includes(order.orderStatus)) {
      res.status(400);
      throw new Error(`Cannot cancel orders that are already marked as [${order.orderStatus}].`);
    }

    // Mark Cancelled
    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    // Replenish product inventories
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Automatically update related payments status parameter to Failed or Voided
    if (order.payment) {
      await Payment.findByIdAndUpdate(order.payment, {
        paymentStatus: 'Failed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'ROY MEN Order has been cancelled successfully, stock reserves reinstated.',
      order: updatedOrder
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin-specific Order Status updates & trigger triggers
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      res.status(400);
      throw new Error(`Target status must reside inside [${validStatuses.join(', ')}].`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order identification index failed.');
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Cannot update status values on historically cancelled order models.');
    }

    // If order was cancelled in this step, return stocks back
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      if (order.payment) {
        await Payment.findByIdAndUpdate(order.payment, {
          paymentStatus: 'Failed'
        });
      }
    }

    // Update state parameters
    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      
      // Auto-toggle payment as Paid if Cash On Delivery was selected
      if (order.paymentMethod === 'COD' && order.payment) {
        await Payment.findByIdAndUpdate(order.payment, {
          paymentStatus: 'Paid',
          verifiedAt: Date.now(),
          verifiedBy: req.user._id
        });
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status transition updated to [${orderStatus}] successfully.`,
      order: updatedOrder
    });

  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrdersAdmin,
  cancelOrder,
  updateOrderStatusAdmin
};
