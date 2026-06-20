import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import cartService from '../services/cartService';
import { AuthContext } from './AuthContext';

export interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity: number, size: string, color: string) => Promise<void>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<void>;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshCartData: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const user = authContext ? authContext.user : null;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart from appropriate storage (database if authenticated, otherwise localStorage guest fallback)
  useEffect(() => {
    const loadCartAndWishlist = async () => {
      setLoading(true);
      setError(null);
      
      if (user) {
        try {
          // Fetch persistent collections from backend cloud db
          const [dbCart, dbWishlist] = await Promise.all([
            cartService.getCart(),
            cartService.getWishlist()
          ]);
          setCart(dbCart);
          setWishlist(dbWishlist);
        } catch (err: any) {
          console.error('[CART_LOAD] Cloud fetch failed, falling back to empty state:', err.message);
          setError('Could not retrieve cart from cloud database.');
        }
      } else {
        // Fallback to offline guest caching
        const guestCartString = localStorage.getItem('guest_cart');
        const guestWishlistString = localStorage.getItem('guest_wishlist');
        setCart(guestCartString ? JSON.parse(guestCartString) : []);
        setWishlist(guestWishlistString ? JSON.parse(guestWishlistString) : []);
      }
      
      setLoading(false);
    };

    loadCartAndWishlist();
  }, [user]);

  // Sync guest cart changes to localStorage when offline
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const refreshCartData = async () => {
    if (!user) return;
    try {
      const [dbCart, dbWishlist] = await Promise.all([
        cartService.getCart(),
        cartService.getWishlist()
      ]);
      setCart(dbCart);
      setWishlist(dbWishlist);
    } catch (err: any) {
      console.error('[CART_REFRESH] Failed refreshing db fields:', err.message);
    }
  };

  const addToCart = async (product: Product, quantity: number, size: string, color: string) => {
    setError(null);
    if (user) {
      setLoading(true);
      try {
        const updatedCart = await cartService.addToCart(product._id, quantity, size, color);
        setCart(updatedCart);
      } catch (err: any) {
        setError(err.message || 'Error occurred adding item to database cart.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Local State modification
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product._id === product._id && item.size === size && item.color === color
        );

        if (existingIndex > -1) {
          const nextCart = [...prev];
          nextCart[existingIndex].quantity += quantity;
          return nextCart;
        }

        return [...prev, { product, quantity, size, color }];
      });
    }
  };

  const removeFromCart = async (productId: string, size: string, color: string) => {
    setError(null);
    if (user) {
      setLoading(true);
      try {
        const updatedCart = await cartService.removeFromCart(productId, size, color);
        setCart(updatedCart);
      } catch (err: any) {
        setError(err.message || 'Error removing item from remote cart.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) =>
        prev.filter((item) => !(item.product._id === productId && item.size === size && item.color === color))
      );
    }
  };

  const updateCartQty = async (productId: string, size: string, color: string, qty: number) => {
    setError(null);
    if (user) {
      setLoading(true);
      try {
        const updatedCart = await cartService.updateCartQty(productId, size, color, qty);
        setCart(updatedCart);
      } catch (err: any) {
        setError(err.message || 'Error updating cart quantity.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product._id === productId && item.size === size && item.color === color
            ? { ...item, quantity: qty }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    setError(null);
    if (user) {
      setLoading(true);
      try {
        await cartService.clearCart();
        setCart([]);
      } catch (err: any) {
        setError(err.message || 'Could not purge online cart.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setCart([]);
    }
  };

  const toggleWishlist = async (product: Product) => {
    setError(null);
    const exists = wishlist.some((item) => item._id === product._id);
    
    if (user) {
      setLoading(true);
      try {
        let nextWishlist: Product[];
        if (exists) {
          nextWishlist = await cartService.removeFromWishlist(product._id);
        } else {
          nextWishlist = await cartService.addToWishlist(product._id);
        }
        setWishlist(nextWishlist);
      } catch (err: any) {
        setError(err.message || 'Could not synchronize wishlist action.');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setWishlist((prev) => {
        if (exists) {
          return prev.filter((item) => item._id !== product._id);
        }
        return [...prev, product];
      });
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        refreshCartData
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
