import api from './api';
import { AdminStats, ApiResponse, Category, Order, PageResponse, Product } from '../types';

export const adminService = {
  getStats: async () => {
    const res = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data.data;
  },
  createProduct: async (productData: any) => {
    const res = await api.post<ApiResponse<Product>>('/admin/products', productData);
    return res.data.data;
  },
  updateProduct: async (id: number, productData: any) => {
    const res = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, productData);
    return res.data.data;
  },
  deleteProduct: async (id: number) => {
    await api.delete(`/admin/products/${id}`);
  },
  createCategory: async (categoryData: any) => {
    const res = await api.post<ApiResponse<Category>>('/admin/categories', categoryData);
    return res.data.data;
  },
  updateCategory: async (id: number, categoryData: any) => {
    const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, categoryData);
    return res.data.data;
  },
  deleteCategory: async (id: number) => {
    await api.delete(`/admin/categories/${id}`);
  },
  getAllOrders: async (page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/admin/orders', { params: { page, size } });
    return res.data.data;
  },
  updateOrderStatus: async (orderId: number, status: string) => {
    const res = await api.put<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { status });
    return res.data.data;
  },
};
