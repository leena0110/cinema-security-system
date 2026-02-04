import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import Navigation from '../Movies/Navigation';
import bookingService from '../../services/booking.service';
import { formatCurrency, formatDate } from '../../utils/securityUtils';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Check for new booking from navigation state
    if (location.state?.newBooking) {
      setSuccess(location.state.message || 'Booking confirmed successfully!');
      // Clear the state
      window.history.replaceState({}, document.title);
    }

    fetchBookings();
  }, [isAuthenticated, navigate, location]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      setError(''); // Clear any previous errors
      console.log('Fetching booking details for:', bookingId);
      const response = await bookingService.getBookingById(bookingId);
      console.log('Response received:', response);
      // response already contains { success, data, signatureValid, securityInfo }
      if (response.success && response.data) {
        setSelectedBooking({
          ...response.data,
          signatureValid: response.signatureValid,
          securityInfo: response.securityInfo
        });
      } else {
        setError('Failed to load booking details');
      }
    } catch (err) {
      console.error('View details error:', err);
      setError(err.response?.data?.message || 'Failed to fetch booking details');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancelLoading(true);
      await bookingService.cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'badge-success',
      pending: 'badge-warning',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading" style={{ background: 'transparent', boxShadow: 'none' }}>
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="bookings-container">
        <div className="bookings-content">
          <div className="bookings-header">
            <h1>My Bookings</h1>
            <p>View and manage your cinema reservations</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <span>⚠️</span>
              {error}
              <button className="alert-close" onClick={() => setError('')}>×</button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓</span>
              {success}
              <button className="alert-close" onClick={() => setSuccess('')}>×</button>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">🎬</div>
              <h2>No Bookings Yet</h2>
              <p>You haven't made any bookings. Start by browsing our movies!</p>
              <button className="btn btn-primary" onClick={() => navigate('/movies')}>
                Browse Movies
              </button>
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map(booking => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header-card">
                    <div className="booking-id">
                      <span className="id-label">Booking ID:</span>
                      <span className="id-value">{booking.bookingId}</span>
                    </div>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-movie">
                    {booking.movieId?.posterUrl && (
                      <img 
                        src={booking.movieId.posterUrl} 
                        alt={booking.movieTitle}
                        className="booking-poster"
                      />
                    )}
                    <div className="booking-movie-details">
                      <h3>{booking.movieTitle}</h3>
                      <div className="booking-datetime">
                        <span>📅 {formatDate(booking.showtime.date)}</span>
                        <span>🕐 {booking.showtime.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-seats">
                    <div className="seats-label">Seats:</div>
                    <div className="seats-list">
                      {booking.seats.map((seat, index) => (
                        <span key={index} className="seat-badge">
                          {seat.row}{seat.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="booking-amount">
                    <span className="amount-label">Total Amount:</span>
                    <span className="amount-value">{formatCurrency(booking.totalAmount)}</span>
                  </div>

                  <div className="booking-date">
                    <span>Booked on: {new Date(booking.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="booking-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewDetails(booking._id)}
                    >
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelLoading}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Booking Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{selectedBooking.bookingId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`badge ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className={`badge ${getStatusBadge(selectedBooking.paymentStatus)}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Movie Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Movie:</span>
                  <span className="detail-value">{selectedBooking.movieTitle}</span>
                </div>
                {selectedBooking.movieId && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Genre:</span>
                      <span className="detail-value">{selectedBooking.movieId.genre}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{selectedBooking.movieId.duration} minutes</span>
                    </div>
                  </>
                )}
              </div>

              <div className="detail-section">
                <h3>Show Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedBooking.showtime.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{selectedBooking.showtime.time}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Seat Details</h3>
                <div className="seats-grid-modal">
                  {selectedBooking.seats.map((seat, index) => (
                    <div key={index} className="seat-detail-card">
                      <div className="seat-number">{seat.row}{seat.seatNumber}</div>
                      <div className="seat-price">{formatCurrency(seat.price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Summary</h3>
                <div className="detail-row">
                  <span className="detail-label">Number of Seats:</span>
                  <span className="detail-value">{selectedBooking.seats.length}</span>
                </div>
                <div className="detail-row total-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value total-amount">
                    {formatCurrency(selectedBooking.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedBooking.signatureValid !== undefined && (
                <div className="detail-section security-section">
                  <h3>🔒 Security Verification</h3>
                  <div className="detail-row">
                    <span className="detail-label">Digital Signature:</span>
                    <span className={`badge ${selectedBooking.signatureValid ? 'badge-success' : 'badge-danger'}`}>
                      {selectedBooking.signatureValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                  {selectedBooking.securityInfo && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Encryption:</span>
                        <span className="detail-value">{selectedBooking.securityInfo.encryptionUsed}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Hash Algorithm:</span>
                        <span className="detail-value">{selectedBooking.securityInfo.hashAlgorithm}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Signature Algorithm:</span>
                        <span className="detail-value">{selectedBooking.securityInfo.signatureAlgorithm}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Integrity Hash:</span>
                        <code className="hash-display">{selectedBooking.securityInfo.integrityHash?.substring(0, 32)}...</code>
                      </div>
                    </>
                  )}
                  <div className="security-note">
                    <p>
                      <strong>Security Features Applied:</strong><br/>
                      ✓ AES-256-CBC Encryption for sensitive data<br/>
                      ✓ RSA Digital Signature for authenticity<br/>
                      ✓ SHA-256 Hash for data integrity<br/>
                      ✓ Base64 Encoding for booking ID
                    </p>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Important Information</h3>
                <ul className="info-list">
                  <li>Please arrive 15 minutes before showtime</li>
                  <li>Carry a valid ID proof for verification</li>
                  <li>Show this booking ID at the cinema counter</li>
                  <li>Outside food and beverages are not allowed</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              {selectedBooking.status === 'confirmed' && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    closeModal();
                    handleCancelBooking(selectedBooking._id);
                  }}
                  disabled={cancelLoading}
                >
                  Cancel Booking
                </button>
              )}
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingConfirmation;