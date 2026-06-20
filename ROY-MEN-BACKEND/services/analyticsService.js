import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

/**
 * Fetch Comprehensive Revenue Analytics
 * @returns {Promise<any>}
 */
export const getRevenueAnalytics = async () => {
  // Aggregate revenue based on paid orders or successful Cash On Delivery transitions
  const revenueSummary = await Order.aggregate([
    {
      $match: {
        orderStatus: { $ne: 'Cancelled' },
        $or: [{ isPaid: true }, { paymentMethod: 'COD', orderStatus: 'Delivered' }]
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        avgOrderValue: { $avg: '$totalPrice' },
        totalSalesCount: { $sum: 1 }
      }
    }
  ]);

  // Aggregate monthly trends for the current/previous years
  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        orderStatus: { $ne: 'Cancelled' },
        $or: [{ isPaid: true }, { paymentMethod: 'COD', orderStatus: 'Delivered' }]
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Aggregate daily trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueByDay = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        orderStatus: { $ne: 'Cancelled' },
        $or: [{ isPaid: true }, { paymentMethod: 'COD', orderStatus: 'Delivered' }]
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Aggregate weekly trends (current year)
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const revenueByWeek = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYear },
        orderStatus: { $ne: 'Cancelled' },
        $or: [{ isPaid: true }, { paymentMethod: 'COD', orderStatus: 'Delivered' }]
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-W%U', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    summary: revenueSummary[0] || { totalRevenue: 0, avgOrderValue: 0, totalSalesCount: 0 },
    revenueByMonth,
    revenueByWeek,
    revenueByDay
  };
};

/**
 * Fetch Order Volume and Status Breakdown Analytics
 * @returns {Promise<any>}
 */
export const getOrderAnalytics = async () => {
  const totalOrders = await Order.countDocuments();

  // Status distributions
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalPrice' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Monthly order volume counts
  const monthlyOrders = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 12 }
  ]);

  // Daily order trends within the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const dailyOrders = await Order.aggregate([
    {
      $match: { createdAt: { $gte: fourteenDaysAgo } }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    totalOrders,
    ordersByStatus,
    monthlyOrders,
    dailyOrders
  };
};

/**
 * Analyze Customer Acquisitions and Core Engagement
 * @returns {Promise<any>}
 */
export const getCustomerAnalytics = async () => {
  // 1. Total Customers in platform
  const totalCustomers = await User.countDocuments({ role: 'customer' });

  // 2. New customers added in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomersCount = await User.countDocuments({
    role: 'customer',
    createdAt: { $gte: thirtyDaysAgo }
  });

  // 3. Active customers (placed at least 1 order in lifetime)
  const activeCustomersList = await Order.distinct('user');
  const activeCustomersCount = activeCustomersList.length;

  // 4. Top Customers based on lifetime spend values (excl. cancelled)
  const topCustomers = await Order.aggregate([
    {
      $match: { orderStatus: { $ne: 'Cancelled' } }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalPrice' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 1,
        totalSpent: 1,
        ordersCount: 1,
        name: '$userDetails.name',
        email: '$userDetails.email',
        phone: '$userDetails.phone'
      }
    }
  ]);

  return {
    totalCustomers,
    newCustomers: newCustomersCount,
    activeCustomersCount,
    inactiveCustomersCount: Math.max(0, totalCustomers - activeCustomersCount),
    topCustomers
  };
};

/**
 * Fetch Detailed Product Performance Metrics
 * @returns {Promise<any>}
 */
export const getProductAnalytics = async () => {
  // 1. Best Selling Products (aggregated based on orderItems quantity)
  const bestSellingProducts = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        soldQuantity: { $sum: '$orderItems.quantity' },
        revenueGenerated: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { soldQuantity: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        soldQuantity: 1,
        revenueGenerated: 1,
        name: { $ifNull: ['$productDetails.name', 'Purged Catalog Item'] },
        sku: { $ifNull: ['$productDetails.sku', 'DEFAULT'] },
        price: { $ifNull: ['$productDetails.price', 0] },
        images: { $ifNull: ['$productDetails.images', []] }
      }
    }
  ]);

  // 2. Low Stock Products (stock between 1 and 5)
  const lowStockProducts = await Product.find({
    stock: { $gt: 0, $lte: 5 },
    isActive: true
  }).select('name sku price stock images');

  // 3. Out of stock products
  const outOfStockProducts = await Product.find({
    stock: 0,
    isActive: true
  }).select('name sku price stock images');

  // 4. Most Viewed Products (utilizing views counters in MongoDB)
  const mostViewedProducts = await Product.find()
    .sort({ views: -1 })
    .limit(10)
    .select('name sku price stock views images');

  return {
    bestSellingProducts,
    lowStock: {
      count: lowStockProducts.length,
      items: lowStockProducts
    },
    outOfStock: {
      count: outOfStockProducts.length,
      items: outOfStockProducts
    },
    mostViewedProducts
  };
};

/**
 * Quick Core Dashboard Metrics (Combined High-Level Metrics)
 * @returns {Promise<any>}
 */
export const getDashboardSummaryMetrics = async () => {
  // Aggregate overall revenue
  const revenueAgg = await Order.aggregate([
    {
      $match: {
        orderStatus: { $ne: 'Cancelled' },
        $or: [{ isPaid: true }, { paymentMethod: 'COD', orderStatus: 'Delivered' }]
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'customer' });
  const totalProducts = await Product.countDocuments();

  // Basic Conversion Ratio analysis mock index for client representations
  const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
  const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

  // Calculate Average Order Value
  const averageValueAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, avgValue: { $avg: '$totalPrice' } } }
  ]);
  const averageOrderValue = averageValueAgg[0]?.avgValue || 0;

  return {
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    orderFulfillmentRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    pendingVolume: pendingOrders,
    averageOrderValue
  };
};

export default {
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getDashboardSummaryMetrics
};
