import api from './api';
import { ApiResponse, Order, PageResponse } from '../types';

export const orderService = {
  createOrder: async (addressId: number, paymentMethod: string) => {
    const res = await api.post<ApiResponse<Order>>('/orders', { addressId, paymentMethod });
    return res.data.data;
  },
  getUserOrders: async (page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/orders', { params: { page, size } });
    return res.data.data;
  },
  getOrderByNumber: async (orderNumber: string) => {
    const res = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
    return res.data.data;
  },
};
