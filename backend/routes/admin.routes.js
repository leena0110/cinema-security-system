const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole, checkObjectPermission } = require('../middleware/auth.middleware');
const accessControlController = require('../controllers/accessControl.controller');

// Movie management routes
router.post(
  '/movies',
  verifyToken,
  checkRole('admin', 'manager'),
  checkObjectPermission('movies', 'create'),
  adminController.createMovie
);

router.put(
  '/movies/:id',
  verifyToken,
  checkRole('admin', 'manager'),
  checkObjectPermission('movies', 'update'),
  adminController.updateMovie
);

router.delete(
  '/movies/:id',
  verifyToken,
  checkRole('admin'),
  checkObjectPermission('movies', 'delete'),
  adminController.deleteMovie
);

// Booking management routes
router.get(
  '/bookings',
  verifyToken,
  checkRole('admin', 'manager'),
  checkObjectPermission('bookings', 'read'),
  adminController.getAllBookings
);

// User management routes
router.get(
  '/users',
  verifyToken,
  checkRole('admin'),
  checkObjectPermission('users', 'read'),
  adminController.getAllUsers
);

router.patch(
  '/users/:id/role',
  verifyToken,
  checkRole('admin'),
  checkObjectPermission('users', 'update'),
  adminController.updateUserRole
);

router.delete(
  '/users/:id',
  verifyToken,
  checkRole('admin'),
  checkObjectPermission('users', 'delete'),
  adminController.deleteUser
);

// Dashboard and reports
router.get(
  '/dashboard',
  verifyToken,
  checkRole('admin', 'manager'),
  adminController.getDashboardStats
);

router.get(
  '/reports',
  verifyToken,
  checkRole('admin', 'manager'),
  checkObjectPermission('reports', 'read'),
  adminController.generateReport
);

// Endpoint to view current access control policy (admin only)
router.get('/access-control-policy', verifyToken, checkRole('admin'), accessControlController.getAccessControlPolicy);

module.exports = router;