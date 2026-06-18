// ============================================================
// SHAADI BAZAAR — Express Server Entry Point
// ============================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://shaadi-bazaar.netlify.app',
    'https://shaadi-bazaar-1eiecepe4-rajaharis04s-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ============================================================
// ROUTES
// ============================================================
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const serviceRoutes = require('./routes/service.routes');
const orderRoutes = require('./routes/order.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const reviewRoutes = require('./routes/review.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '💍 Shaadi Bazaar API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`\n💍 Shaadi Bazaar Backend`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
