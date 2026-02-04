const mongoose = require('mongoose');

const showTimeSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 100
  },
  price: {
    type: Number,
    required: true
  },
  seats: [{
    seatNumber: String,
    row: String,
    status: {
      type: String,
      enum: ['available', 'booked', 'selected'],
      default: 'available'
    },
    price: Number
  }]
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  rating: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String
  },
  showtimes: [showTimeSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movie', movieSchema);