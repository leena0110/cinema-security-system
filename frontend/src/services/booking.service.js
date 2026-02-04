import api from './api';

const bookingService = {
  // Get all movies
  getAllMovies: async () => {
    const response = await api.get('/bookings/movies');
    return response.data;
  },

  // Get movie by ID
  getMovieById: async (id) => {
    const response = await api.get(`/bookings/movies/${id}`);
    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get user bookings
  getUserBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  }
};

export default bookingService;