import api from './api';
import { Order, PaymentDetails, DashboardStats } from '../types';

export interface CreateOrderPayload {
  shippingAddress: string;
  phone: string;
  paymentMethod: 'COD' | 'bKash' | 'Nagad';
  transactionId?: string;
  senderPhone?: string;
  shippingPrice?: number;
}

export interface OrderQueryResponse {
  success: boolean;
  order: Order;
}

export interface OrdersListResponse {
  success: boolean;
  count: number;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  orders: Order[];
}

export interface PaymentDetailsResponse {
  success: boolean;
  payment: PaymentDetails;
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    orderFulfillmentRate: number;
    pendingVolume: number;
    averageOrderValue: number;
  };
}

export const orderService = {
  /**
   * Submit/Place a new order on the backend
   */
  placeOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await api.post<{ success: boolean; order: Order }>('/orders', payload);
    return response.data.order;
  },

  /**
   * Check a single order details by ObjectId
   */
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get<OrderQueryResponse>(`/orders/${id}`);
    return response.data.order;
  },

  /**
   * Fetch current authenticated customer's list of orders
   */
  getMyOrders: async (filters?: { page?: number; limit?: number; status?: string }): Promise<OrdersListResponse> => {
    const response = await api.get<OrdersListResponse>('/orders/my-orders', { params: filters });
    return response.data;
  },

  /**
   * Cancel an order (User can only cancel a 'Pending' order; Admin can cancel anytime)
   */
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.put<OrderQueryResponse>(`/orders/${id}/cancel`);
    return response.data.order;
  },

  /**
   * Admin Mode: Fetch ALL orders across the storefront
   */
  getAllOrdersAdmin: async (filters?: { page?: number; limit?: number; status?: string }): Promise<OrdersListResponse> => {
    const response = await api.get<OrdersListResponse>('/orders/admin', { params: filters });
    return response.data;
  },

  /**
   * Admin Mode: Update order status transition (Pending -> Confirmed -> Shipped etc.)
   */
  updateOrderStatusAdmin: async (id: string, orderStatus: Order['orderStatus']): Promise<Order> => {
    const response = await api.put<OrderQueryResponse>(`/orders/${id}/status`, { orderStatus });
    return response.data.order;
  },

  // Payment Endpoints Integration
  
  /**
   * Fetch details of a specific payment ledger
   */
  getPaymentDetails: async (id: string): Promise<PaymentDetails> => {
    const response = await api.get<PaymentDetailsResponse>(`/payments/${id}`);
    return response.data.payment;
  },

  /**
   * User: Submit a manual/edited bKash or Nagad Transaction ID & sender phone
   */
  submitTransactionId: async (paymentId: string, transactionId: string, senderPhone: string): Promise<PaymentDetails> => {
    const response = await api.put<PaymentDetailsResponse>(`/payments/${paymentId}/submit-txid`, {
      transactionId,
      senderPhone,
    });
    return response.data.payment;
  },

  /**
   * Admin Mode: Approve or deny a transaction, which automatically keeps parent order paid status synchronized
   */
  updatePaymentStatusAdmin: async (paymentId: string, paymentStatus: PaymentDetails['paymentStatus']): Promise<PaymentDetails> => {
    const response = await api.put<PaymentDetailsResponse>(`/payments/${paymentId}/verify`, {
      paymentStatus,
    });
    return response.data.payment;
  },

  // Analytics API Integration
  
  /**
   * Admin Mode: Retrieve analytical performance KPIs for the operational bento dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<AnalyticsOverviewResponse>('/analytics/dashboard');
    const b = response.data.stats;
    return {
      totalRevenue: b.totalRevenue || 0,
      totalOrders: b.totalOrders || 0,
      totalUsers: b.totalUsers || 0,
      totalProducts: b.totalProducts || 0,
      orderFulfillmentRate: b.orderFulfillmentRate || 0,
      pendingVolume: b.pendingVolume || 0,
      averageOrderValue: b.averageOrderValue || 0,
    };
  }
};

export default orderService;
