const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const addressRoutes = require('./routes/address.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/errorHandler');
const { apiResponse } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check / API root
app.get('/api', (req, res) => {
  return apiResponse(res, 200, true, 'NexStore E-Commerce Node.js Express API is running', {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  return apiResponse(res, 404, false, `Resource not found on endpoint: ${req.method} ${req.originalUrl}`);
});

// Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NexStore Express Server running on http://localhost:${PORT}`);
  console.log(`📦 REST API Base URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

module.exports = app;
