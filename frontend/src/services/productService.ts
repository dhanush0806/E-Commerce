import api from './api';
import { ApiResponse, PageResponse, Product } from '../types';

export const productService = {
  getProducts: async (page = 0, size = 12, sortBy = 'id', sortDir = 'asc', categoryId?: number) => {
    const params: any = { page, size, sortBy, sortDir };
    if (categoryId) params.categoryId = categoryId;
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },
  searchProducts: async (query: string, page = 0, size = 12) => {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products/search', {
      params: { query, page, size },
    });
    return res.data.data;
  },
  getProductById: async (id: number) => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },
  getProductBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`);
    return res.data.data;
  },
};
