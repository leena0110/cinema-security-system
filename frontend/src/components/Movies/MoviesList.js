import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import Navigation from './Navigation';
import bookingService from '../../services/booking.service';
import { formatCurrency, formatDate } from '../../utils/securityUtils';
import './MoviesList.css';

const MoviesList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStep, setBookingStep] = useState(1); // 1: movies, 2: showtimes, 3: seats

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchMovies();
  }, [isAuthenticated, navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllMovies();
      setMovies(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setBookingStep(2);
    setError('');
  };

  const handleSelectShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setBookingStep(3);
    setError('');
  };

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available') return;

    const seatId = seat.row + seat.seatNumber;
    const isSelected = selectedSeats.some(s => s.row + s.seatNumber === seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.row + s.seatNumber !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        setError('Maximum 10 seats can be selected');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
    setError('');
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        movieId: selectedMovie._id,
        showtimeId: selectedShowtime._id,
        seats: selectedSeats.map(seat => ({
          row: seat.row,
          seatNumber: seat.seatNumber,
          price: seat.price
        }))
      };

      const response = await bookingService.createBooking(bookingData);
      
      // Navigate to bookings page with success message
      navigate('/bookings', { 
        state: { 
          newBooking: response.data,
          message: response.message 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (bookingStep === 3) {
      setBookingStep(2);
      setSelectedSeats([]);
    } else if (bookingStep === 2) {
      setBookingStep(1);
      setSelectedMovie(null);
      setSelectedShowtime(null);
    }
    setError('');
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const getSeatStatus = (seat) => {
    const seatId = seat.row + seat.seatNumber;
    const isSelected = selectedSeats.some(s => s.row + s.seatNumber === seatId);
    
    if (isSelected) return 'selected';
    return seat.status;
  };

  if (loading && movies.length === 0) {
    return (
      <>
        <Navigation />
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading" style={{ background: 'transparent', boxShadow: 'none' }}>
            <div className="spinner"></div>
            <p>Loading movies...</p>
          </div>
        </div>
      </>
    );
  }

  return (
      <>
        <Navigation />
        <div className="movies-container">
          <div className="movies-content">
          {error && (
            <div className="alert alert-danger">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {bookingStep === 1 && (
            <div className="movies-section">
              <div className="section-header">
                <h1>Now Showing</h1>
                <p>Select a movie to book your seats</p>
              </div>

              <div className="movies-grid">
                {movies.map(movie => (
                  <div key={movie._id} className="movie-card">
                    <div className="movie-poster">
                      <img src={movie.posterUrl} alt={movie.title} />
                      <div className="movie-overlay">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSelectMovie(movie)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="badge badge-info">{movie.genre}</span>
                        <span className="badge badge-warning">{movie.rating}</span>
                        <span>{movie.duration} min</span>
                      </div>
                      <p className="movie-description">{movie.description}</p>
                      <div className="movie-details">
                        <span>🌐 {movie.language}</span>
                        <span>🎬 {movie.showtimes.length} shows</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookingStep === 2 && selectedMovie && (
            <div className="showtime-section">
              <button className="btn btn-secondary mb-3" onClick={handleBack}>
                ← Back to Movies
              </button>

              <div className="selected-movie-header">
                <img src={selectedMovie.posterUrl} alt={selectedMovie.title} />
                <div>
                  <h2>{selectedMovie.title}</h2>
                  <p>{selectedMovie.genre} • {selectedMovie.duration} min • {selectedMovie.language}</p>
                </div>
              </div>

              <h3>Select Showtime</h3>
              <div className="showtimes-grid">
                {selectedMovie.showtimes.map(showtime => (
                  <div
                    key={showtime._id}
                    className="showtime-card"
                    onClick={() => handleSelectShowtime(showtime)}
                  >
                    <div className="showtime-date">
                      {formatDate(showtime.date)}
                    </div>
                    <div className="showtime-time">{showtime.time}</div>
                    <div className="showtime-price">
                      From {formatCurrency(showtime.price * 0.8)}
                    </div>
                    <div className="showtime-availability">
                      {showtime.availableSeats} seats available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookingStep === 3 && selectedShowtime && (
            <div className="seats-section">
              <button className="btn btn-secondary mb-3" onClick={handleBack}>
                ← Back to Showtimes
              </button>

              <div className="booking-summary-header">
                <div className="booking-movie-info">
                  <h2>{selectedMovie.title}</h2>
                  <p>
                    {formatDate(selectedShowtime.date)} • {selectedShowtime.time}
                  </p>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="booking-total">
                    <div className="total-label">Total Amount</div>
                    <div className="total-amount">{formatCurrency(calculateTotal())}</div>
                    <div className="total-seats">{selectedSeats.length} seat(s)</div>
                  </div>
                )}
              </div>

              <div className="screen-section">
                <div className="screen">
                  <div className="screen-label">SCREEN</div>
                </div>
              </div>

              <div className="seats-legend">
                <div className="legend-item">
                  <div className="seat-demo available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="seat-demo selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="seat-demo booked"></div>
                  <span>Booked</span>
                </div>
              </div>

              <div className="seats-container">
                {Array.from(new Set(selectedShowtime.seats.map(s => s.row))).map(row => (
                  <div key={row} className="seat-row">
                    <div className="row-label">{row}</div>
                    <div className="seats">
                      {selectedShowtime.seats
                        .filter(seat => seat.row === row)
                        .map(seat => (
                          <div
                            key={seat.row + seat.seatNumber}
                            className={`seat ${getSeatStatus(seat)}`}
                            onClick={() => handleSeatClick(seat)}
                            title={`${seat.row}${seat.seatNumber} - ${formatCurrency(seat.price)}`}
                          >
                            {seat.seatNumber}
                          </div>
                        ))}
                    </div>
                    <div className="row-label">{row}</div>
                  </div>
                ))}
              </div>

              {selectedSeats.length > 0 && (
                <div className="selected-seats-info">
                  <h4>Selected Seats:</h4>
                  <div className="selected-seats-list">
                    {selectedSeats.map(seat => (
                      <span key={seat.row + seat.seatNumber} className="selected-seat-badge">
                        {seat.row}{seat.seatNumber} ({formatCurrency(seat.price)})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="booking-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleBooking}
                  disabled={selectedSeats.length === 0 || loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    `Confirm Booking - ${formatCurrency(calculateTotal())}`
                  )}
                </button>
              </div>

              <div className="pricing-info">
                <h4>💡 Dynamic Pricing</h4>
                <ul>
                  <li>Rows A-B (Front): 20% discount</li>
                  <li>Rows C-D (Standard): Base price</li>
                  <li>Rows E-F (Premium): 20% premium</li>
                  <li>Rows G-H (Standard): Base price</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MoviesList;