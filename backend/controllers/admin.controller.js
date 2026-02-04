const Movie = require('../models/Movie.model');
const Booking = require('../models/Booking.model');
const User = require('../models/User.model');
const HashingUtil = require('../utils/hashing.util');

// Create movie (Admin/Manager only)
const createMovie = async (req, res) => {
  try {
    const { title, description, genre, duration, rating, language, posterUrl, showtimes } = req.body;

    // Validation
    if (!title || !description || !genre || !duration || !rating || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required movie details.'
      });
    }

    // Initialize seats for each showtime
    const showtimesWithSeats = showtimes.map(showtime => {
      const seats = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const seatsPerRow = 12;

      rows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
          let price = showtime.price || 200;
          
          // Dynamic pricing based on seat position
          if (row === 'A' || row === 'B') {
            price = price * 0.8; // Front seats - 20% discount
          } else if (row === 'E' || row === 'F') {
            price = price * 1.2; // Premium seats - 20% premium
          }

          seats.push({
            seatNumber: i.toString().padStart(2, '0'),
            row: row,
            status: 'available',
            price: Math.round(price)
          });
        }
      });

      return {
        ...showtime,
        seats,
        availableSeats: seats.length
      };
    });

    const movie = new Movie({
      title,
      description,
      genre,
      duration,
      rating,
      language,
      posterUrl,
      showtimes: showtimesWithSeats
    });

    await movie.save();

    console.log(`[ADMIN] Movie created: ${title} by ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      data: movie
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating movie.',
      error: error.message
    });
  }
};

// Update movie (Admin/Manager only)
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'showtimes') {
        movie[key] = updates[key];
      }
    });

    await movie.save();

    console.log(`[ADMIN] Movie updated: ${movie.title} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      data: movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating movie.',
      error: error.message
    });
  }
};

// Delete movie (Admin only)
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    // Soft delete - mark as inactive
    movie.isActive = false;
    await movie.save();

    console.log(`[ADMIN] Movie deleted: ${movie.title} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully.'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting movie.',
      error: error.message
    });
  }
};

// Get all bookings (Admin/Manager only)
const getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'username email')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings.',
      error: error.message
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users.',
      error: error.message
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'manager'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role.'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.role = role;
    await user.save();

    console.log(`[ADMIN] User role updated: ${user.username} to ${role} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role.',
      error: error.message
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent deleting protected accounts
    if (user.username === 'admin' || user.username === 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete protected admin or manager accounts.'
      });
    }

    // Delete user's bookings first
    await Booking.deleteMany({ userId: id });
    
    await User.findByIdAndDelete(id);

    console.log(`[ADMIN] User deleted: ${user.username} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: {
        username: user.username
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user.',
      error: error.message
    });
  }
};

// Get dashboard statistics (Admin/Manager only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('userId', 'username email')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMovies,
          totalBookings,
          revenue: totalRevenue[0]?.total || 0
        },
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics.',
      error: error.message
    });
  }
};

// Generate report (Admin/Manager only)
const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let reportData;

    switch (reportType) {
      case 'bookings':
        reportData = await Booking.find(query)
          .populate('userId', 'username email')
          .populate('movieId', 'title')
          .sort({ createdAt: -1 });
        break;

      case 'revenue':
        reportData = await Booking.aggregate([
          { $match: { ...query, status: 'confirmed' } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              totalRevenue: { $sum: '$totalAmount' },
              bookingCount: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
        ]);
        break;

      case 'movies':
        reportData = await Movie.find({ isActive: true });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type.'
        });
    }

    // Generate report hash for integrity
    const reportHash = HashingUtil.sha256(JSON.stringify(reportData));

    console.log(`[ADMIN] Report generated: ${reportType} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      reportType,
      generatedAt: new Date(),
      reportHash,
      data: reportData
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report.',
      error: error.message
    });
  }
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  getAllBookings,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  generateReport
};