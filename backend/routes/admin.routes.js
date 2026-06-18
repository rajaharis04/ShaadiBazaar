// ============================================================
// ADMIN ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const {
  getStats, getAllOrders, updateOrderStatus, getAllBookings, updateBookingStatus, getAllUsers
} = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id', updateBookingStatus);
router.get('/users', getAllUsers);

module.exports = router;
