const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const reportRoutes = require('./routes/report.routes');
const settingsRoutes = require('./routes/settings.routes');
const reviewRoutes = require('./routes/review.routes');
const addressRoutes = require('./routes/address.routes');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }));
app.use(morgan('dev', { stream: { write: msg => logger.http(msg.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
