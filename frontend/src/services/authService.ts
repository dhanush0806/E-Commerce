import api from './api';
import { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  register: async (userData: any) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return res.data.data;
  },
  getCurrentUser: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },
};
