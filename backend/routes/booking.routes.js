// ============================================================
// BOOKING ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBooking } = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getMyBookings);
router.put('/:id', authMiddleware, updateBooking);

module.exports = router;
