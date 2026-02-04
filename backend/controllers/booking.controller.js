const Booking = require('../models/Booking.model');
const Movie = require('../models/Movie.model');
const User = require('../models/User.model');
const encryptionUtil = require('../utils/encryption.util');
const digitalSignatureUtil = require('../utils/digitalSignature.util');
const EncodingUtil = require('../utils/encoding.util');
const HashingUtil = require('../utils/hashing.util');
const emailUtil = require('../utils/email.util');
const mongoose = require('mongoose');

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching movies.',
      error: error.message
    });
  }
};

// Get movie by ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching movie.',
      error: error.message
    });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const { movieId, showtimeId, seats } = req.body;
    const userId = req.user._id;

    // Validation
    if (!movieId || !showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details.'
      });
    }

    // Find movie
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    // Find showtime
    const showtime = movie.showtimes.id(showtimeId);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.'
      });
    }

    // Check seat availability
    const requestedSeatNumbers = seats.map(s => s.row + s.seatNumber);
    const unavailableSeats = [];

    for (const seatNum of requestedSeatNumbers) {
      const seat = showtime.seats.find(s => s.row + s.seatNumber === seatNum);
      if (!seat || seat.status !== 'available') {
        unavailableSeats.push(seatNum);
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are not available.',
        unavailableSeats
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const bookedSeats = [];

    for (const seatReq of seats) {
      const seatNum = seatReq.row + seatReq.seatNumber;
      const seat = showtime.seats.find(s => s.row + s.seatNumber === seatNum);
      
      if (seat) {
        totalAmount += seat.price;
        bookedSeats.push({
          seatNumber: seatReq.seatNumber,
          row: seatReq.row,
          price: seat.price
        });
        
        // Mark seat as booked
        seat.status = 'booked';
      }
    }

    // Generate booking ID
    const bookingId = EncodingUtil.encodeBookingId(movie._id.toString().substring(0, 8));

    // Prepare booking data
    const bookingData = {
      userId,
      movieId,
      movieTitle: movie.title,
      showtime: {
        time: showtime.time,
        date: showtime.date
      },
      seats: bookedSeats,
      totalAmount,
      bookingId
    };

    // Encrypt sensitive booking data (Base64)
    const encryptedData = encryptionUtil.encryptBookingData(bookingData);

    // Generate digital signature
    const signature = digitalSignatureUtil.signBooking(bookingData);

    // Create booking
    const booking = new Booking({
      ...bookingData,
      digitalSignature: signature,
      encryptedData: encryptedData.encryptedData, // Base64 string
      iv: encryptedData.iv // Store IV for decryption
    });

    await booking.save();

    // Update movie showtime
    await movie.save();

    // Send confirmation email
    const user = await User.findById(userId);
    try {
      await emailUtil.sendBookingConfirmation(user.email, {
        ...bookingData,
        username: user.username
      });
    } catch (emailError) {
      console.log('Email sending failed, but booking was created:', emailError.message);
    }

    // Log booking hash
    const bookingHash = HashingUtil.hashBookingData(bookingData);
    console.log(`[BOOKING] Created with hash: ${bookingHash}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Confirmation email sent.',
      data: {
        bookingId: booking.bookingId,
        movieTitle: booking.movieTitle,
        showtime: booking.showtime,
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking.',
      error: error.message
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate('movieId', 'title posterUrl');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings.',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`[GET BOOKING] ID: ${id}, User: ${userId}`);

    const booking = await Booking.findOne({
      _id: id,
      userId
    }).populate('movieId', 'title description posterUrl genre duration');

    if (!booking) {
      console.log(`[GET BOOKING] Not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Verify digital signature
    const movieIdForSignature = booking.movieId?._id || booking.movieId;
    const bookingData = {
      userId: booking.userId,
      movieId: movieIdForSignature,
      movieTitle: booking.movieTitle,
      showtime: booking.showtime,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      bookingId: booking.bookingId
    };

    let isValid = false;
    try {
      isValid = digitalSignatureUtil.verifyBooking(
        bookingData,
        booking.digitalSignature
      );
    } catch (sigError) {
      console.log('[GET BOOKING] Signature verification error:', sigError.message);
    }

    // Calculate booking hash for integrity verification
    const bookingHash = HashingUtil.hashBookingData(bookingData);

    console.log(`[GET BOOKING] Success for ID: ${booking.bookingId}`);

    res.status(200).json({
      success: true,
      data: booking,
      signatureValid: isValid,
      securityInfo: {
        digitalSignature: booking.digitalSignature ? booking.digitalSignature.substring(0, 64) + '...' : null,
        signatureValid: isValid,
        integrityHash: bookingHash,
        encryptionUsed: 'AES-256-CBC',
        hashAlgorithm: 'SHA-256',
        signatureAlgorithm: 'RSA-SHA256'
      }
    });
  } catch (error) {
    console.error('[GET BOOKING] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking.',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({
      _id: id,
      userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled.'
      });
    }

    // Check if showtime has passed
    const showtimeDate = new Date(booking.showtime.date);
    if (showtimeDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past bookings.'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Release seats
    const movie = await Movie.findById(booking.movieId);
    if (movie) {
      const showtime = movie.showtimes.find(
        st => st.time === booking.showtime.time && 
        new Date(st.date).getTime() === new Date(booking.showtime.date).getTime()
      );

      if (showtime) {
        booking.seats.forEach(bookedSeat => {
          const seat = showtime.seats.find(
            s => s.row === bookedSeat.row && s.seatNumber === bookedSeat.seatNumber
          );
          if (seat) {
            seat.status = 'available';
          }
        });
        await movie.save();
      }
    }

    // Log cancellation with hash
    const cancelHash = HashingUtil.sha256(booking._id.toString() + Date.now());
    console.log(`[BOOKING CANCELLED] ID: ${booking.bookingId}, Hash: ${cancelHash}`);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking.',
      error: error.message
    });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
};