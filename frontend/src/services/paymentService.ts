import api from './api';
import { ApiResponse, Order } from '../types';

export const paymentService = {
  simulatePayment: async (orderNumber: string, success = true) => {
    const res = await api.post<ApiResponse<Order>>('/payments/simulate', { orderNumber, success });
    return res.data.data;
  },
};
