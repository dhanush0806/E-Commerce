import api from './api';
import { ApiResponse, Cart } from '../types';

export const cartService = {
  getCart: async () => {
    const res = await api.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },
  addToCart: async (productId: number, quantity: number) => {
    const res = await api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return res.data.data;
  },
  updateQuantity: async (cartItemId: number, quantity: number) => {
    const res = await api.put<ApiResponse<Cart>>(`/cart/items/${cartItemId}`, { quantity });
    return res.data.data;
  },
  removeItem: async (cartItemId: number) => {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${cartItemId}`);
    return res.data.data;
  },
};
