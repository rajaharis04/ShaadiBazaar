// ============================================================
// CATEGORY ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Public route to view categories
router.get('/', getAllCategories);

// Admin-only routes to manage categories
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:key', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:key', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
