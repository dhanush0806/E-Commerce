import api from './api';
import { Address, ApiResponse } from '../types';

export const addressService = {
  getUserAddresses: async () => {
    const res = await api.get<ApiResponse<Address[]>>('/addresses');
    return res.data.data;
  },
  addAddress: async (address: Address) => {
    const res = await api.post<ApiResponse<Address>>('/addresses', address);
    return res.data.data;
  },
  deleteAddress: async (id: number) => {
    await api.delete(`/addresses/${id}`);
  },
};
