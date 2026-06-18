// ============================================================
// AUTH ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const {
  sendOtp,
  register,
  login,
  adminLogin,
  logout,
  getMe,
  updateProfile
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/send-otp',    sendOtp);
router.post('/register',    register);
router.post('/login',       login);
router.post('/admin-login', adminLogin);
router.post('/logout',      logout);
router.get('/me',           authMiddleware, getMe);
router.put('/profile',      authMiddleware, updateProfile);

module.exports = router;
