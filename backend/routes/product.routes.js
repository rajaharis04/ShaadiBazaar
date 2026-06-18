// ============================================================
// PRODUCT ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview
} = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.post('/:id/review', authMiddleware, addReview);

module.exports = router;
