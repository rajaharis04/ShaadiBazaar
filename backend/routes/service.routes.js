// ============================================================
// SERVICE ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const {
  getAllServices, getServiceById, createService, updateService, deleteService
} = require('../controllers/service.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

module.exports = router;
