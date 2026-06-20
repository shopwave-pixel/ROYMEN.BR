export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Review {
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string; // Category ID or name
  isActive: boolean;
  views: number;
  rating?: number;
  reviews?: Review[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  shippingAddress: string;
  phone: string;
  paymentMethod: 'COD' | 'bKash' | 'Nagad';
  shippingPrice: number;
  totalPrice: number;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  payment?: string;
  createdAt: string;
}

export interface PaymentDetails {
  _id: string;
  user: string;
  order: string;
  paymentMethod: 'COD' | 'bKash' | 'Nagad';
  amount: number;
  transactionId?: string;
  senderPhone?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  verifiedAt?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  orderFulfillmentRate: number;
  pendingVolume: number;
  averageOrderValue: number;
}
