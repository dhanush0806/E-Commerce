import api from './api';
import { ApiResponse, Category } from '../types';

export const categoryService = {
  getAllCategories: async () => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
  getCategoryById: async (id: number) => {
    const res = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data;
  },
};
