import { useContext } from 'react';
import { CartContext, CartContextType } from '../context/CartContext';

/**
 * Access the application cart and wishlist state and business tasks.
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider root banner wrapper.');
  }
  return context;
};

export default useCart;
