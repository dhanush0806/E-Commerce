import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Home } from '../pages/Home/Home';
import { Products } from '../pages/Products/Products';
import { ProductDetails } from '../pages/ProductDetails/ProductDetails';
import { Search } from '../pages/Search/Search';
import { Cart } from '../pages/Cart/Cart';
import { Checkout } from '../pages/Checkout/Checkout';
import { Login } from '../pages/Login/Login';
import { Register } from '../pages/Register/Register';
import { Profile } from '../pages/Profile/Profile';
import { OrderHistory } from '../pages/OrderHistory/OrderHistory';
import { OrderDetails } from '../pages/OrderDetails/OrderDetails';
import { NotFound } from '../pages/NotFound/NotFound';

import { AdminDashboard } from '../pages/Admin/Dashboard/AdminDashboard';
import { AdminProducts } from '../pages/Admin/Products/AdminProducts';
import { AdminCategories } from '../pages/Admin/Categories/AdminCategories';
import { AdminOrders } from '../pages/Admin/Orders/AdminOrders';

import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/search" element={<Search />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Account Routes */}
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/orders/:orderNumber" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

      {/* Admin Operations Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
