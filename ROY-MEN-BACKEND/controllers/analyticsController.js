import analyticsService from '../services/analyticsService.js';

/**
 * @desc    Get High-Level Summary Overview Metrics for Admin Dashboard Cards
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private/Admin
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardSummaryMetrics();
    res.status(200).json({
      success: true,
      message: 'Dashboard metrics compiled successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get In-Depth Revenue Trends (by day, week, month)
 * @route   GET /api/v1/analytics/revenue
 * @access  Private/Admin
 */
export const getRevenueStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getRevenueAnalytics();
    res.status(200).json({
      success: true,
      message: 'Revenue analytics charts retrieved successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Order Progress patterns and volumes
 * @route   GET /api/v1/analytics/orders
 * @access  Private/Admin
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getOrderAnalytics();
    res.status(200).json({
      success: true,
      message: 'Order metrics patterns compiled successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Customer Engagement, streak metrics & top purchasers
 * @route   GET /api/v1/analytics/customers
 * @access  Private/Admin
 */
export const getCustomerStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getCustomerAnalytics();
    res.status(200).json({
      success: true,
      message: 'Customer performance metrics loaded successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Product levels diagnostics (best sellers, stock warning, lookups views)
 * @route   GET /api/v1/analytics/products
 * @access  Private/Admin
 */
export const getProductStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getProductAnalytics();
    res.status(200).json({
      success: true,
      message: 'Product metrics loaded successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardOverview,
  getRevenueStats,
  getOrderStats,
  getCustomerStats,
  getProductStats
};
