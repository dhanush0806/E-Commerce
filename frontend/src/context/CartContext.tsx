import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number) => {
    const updated = await cartService.addToCart(productId, quantity);
    setCart(updated);
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    const updated = await cartService.updateQuantity(cartItemId, quantity);
    setCart(updated);
  };

  const removeItem = async (cartItemId: number) => {
    const updated = await cartService.removeItem(cartItemId);
    setCart(updated);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart?.totalItems || 0,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
