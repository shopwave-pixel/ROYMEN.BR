import api from './api';
import { Product, CartItem } from '../types';
import { normalizeProduct } from './productService';

export interface CartResponse {
  success: boolean;
  cart: {
    _id: string;
    user: string;
    items: Array<{
      product: any; // Raw product from backend population
      quantity: number;
      size: string;
      color: string;
      price: number;
      _id: string;
    }>;
    totalPrice: number;
  };
}

export interface WishlistResponse {
  success: boolean;
  wishlist: {
    _id: string;
    user: string;
    products: any[]; // Raw products populated
  };
}

export const cartService = {
  /**
   * Fetch the active user's cart from persistent backend db
   */
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get<CartResponse>('/cart');
    const items = response.data.cart?.items || [];
    return items.map((item) => ({
      product: normalizeProduct(item.product),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  },

  /**
   * Add a product configuration block to the user's backend database cart
   */
  addToCart: async (productId: string, quantity: number, size: string, color: string): Promise<CartItem[]> => {
    const response = await api.post<CartResponse>('/cart/add', { productId, quantity, size, color });
    const items = response.data.cart?.items || [];
    return items.map((item) => ({
      product: normalizeProduct(item.product),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  },

  /**
   * Remove a product configuration block from the user's backend database cart
   */
  removeFromCart: async (productId: string, size: string, color: string): Promise<CartItem[]> => {
    const response = await api.post<CartResponse>('/cart/remove', { productId, size, color });
    const items = response.data.cart?.items || [];
    return items.map((item) => ({
      product: normalizeProduct(item.product),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  },

  /**
   * Update the quantity allocation of a cart item
   */
  updateCartQty: async (productId: string, size: string, color: string, quantity: number): Promise<CartItem[]> => {
    const response = await api.put<CartResponse>('/cart/update', { productId, size, color, quantity });
    const items = response.data.cart?.items || [];
    return items.map((item) => ({
      product: normalizeProduct(item.product),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  },

  /**
   * Erase all records from the current persistent cart
   */
  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },

  // Wishlist API Integration Functions mapped in this service for modular synthesis
  
  /**
   * Fetch the active user's saved wishlist catalog from backend db
   */
  getWishlist: async (): Promise<Product[]> => {
    const response = await api.get<WishlistResponse>('/wishlist');
    const products = response.data.wishlist?.products || [];
    return products.map(normalizeProduct);
  },

  /**
   * Add a product ID to the user's backend persistent wishlist
   */
  addToWishlist: async (productId: string): Promise<Product[]> => {
    const response = await api.post<WishlistResponse>('/wishlist/add', { productId });
    const products = response.data.wishlist?.products || [];
    return products.map(normalizeProduct);
  },

  /**
   * Remove a product ID from the user's backend persistent wishlist
   */
  removeFromWishlist: async (productId: string): Promise<Product[]> => {
    const response = await api.post<WishlistResponse>('/wishlist/remove', { productId });
    const products = response.data.wishlist?.products || [];
    return products.map(normalizeProduct);
  }
};

export default cartService;
