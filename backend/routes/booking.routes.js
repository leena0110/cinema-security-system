const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, checkObjectPermission } = require('../middleware/auth.middleware');

// Get all movies (public/authenticated)
router.get('/movies', verifyToken, bookingController.getAllMovies);

// Get movie by ID
router.get('/movies/:id', verifyToken, bookingController.getMovieById);

// Create booking
router.post(
  '/',
  verifyToken,
  checkObjectPermission('bookings', 'create'),
  bookingController.createBooking
);

// Get user bookings
router.get(
  '/my-bookings',
  verifyToken,
  (req, res, next) => {
    // If user is a regular user, check 'read_own', else check 'read'
    const role = req.user?.role;
    if (role === 'user') {
      return require('../middleware/auth.middleware').checkObjectPermission('bookings', 'read_own')(req, res, next);
    } else {
      return require('../middleware/auth.middleware').checkObjectPermission('bookings', 'read')(req, res, next);
    }
  },
  bookingController.getUserBookings
);

// Get booking by ID
router.get(
  '/:id',
  verifyToken,
  checkObjectPermission('bookings', 'read'),
  bookingController.getBookingById
);

// Cancel booking
router.patch(
  '/:id/cancel',
  verifyToken,
  bookingController.cancelBooking
);

module.exports = router;