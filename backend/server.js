const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { syncAccessControlToDB } = require('./controllers/accessControl.controller');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Sync access control policy to DB on server start
syncAccessControlToDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cinema Booking API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Cinema Seat Reservation & Dynamic Pricing System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      bookings: '/api/bookings',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🎬 Cinema Seat Reservation System                       ║
  ║   Server running on port ${PORT}                              ║
  ║                                                            ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
  ║   API Endpoint: http://localhost:${PORT}                      ║
  ║                                                            ║
  ║   Security Features:                                       ║
  ║   ✓ Multi-Factor Authentication (Password + Email OTP)    ║
  ║   ✓ Role-Based Access Control (User/Manager/Admin)        ║
  ║   ✓ AES-256 Encryption                                     ║
  ║   ✓ SHA-256/SHA-512 Hashing                                ║
  ║   ✓ Digital Signatures                                     ║
  ║   ✓ Base64/Hex Encoding                                    ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;