// ============================================================
// ORDER ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrderById } = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, placeOrder);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
