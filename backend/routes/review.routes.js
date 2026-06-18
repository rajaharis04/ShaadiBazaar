// ============================================================
// REVIEW ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/:type/:id', getReviews);
router.post('/:type/:id', authMiddleware, addReview);

module.exports = router;
