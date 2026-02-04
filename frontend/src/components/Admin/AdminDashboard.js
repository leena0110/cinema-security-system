import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import Navigation from '../Movies/Navigation';
import api from '../../services/api';
import './Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalBookings: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      navigate('/movies');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data.stats);
        setRecentBookings(response.data.data.recentBookings || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="admin-container">
        <div className="admin-content">
          <div className="admin-header">
            <h1>📊 Admin Dashboard</h1>
            <p>Welcome back, {user?.username}! Here's your cinema overview.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎬</div>
              <div className="stat-info">
                <h3>{stats.totalMovies}</h3>
                <p>Movies</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎟️</div>
              <div className="stat-info">
                <h3>{stats.totalBookings}</h3>
                <p>Bookings</p>
              </div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>₹{stats.revenue?.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="section">
              <h2>📋 Recent Bookings</h2>
              {recentBookings.length === 0 ? (
                <p className="no-data">No bookings yet</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>User</th>
                      <th>Movie</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking._id}>
                        <td><code>{booking.bookingId}</code></td>
                        <td>{booking.userId?.username || 'N/A'}</td>
                        <td>{booking.movieTitle}</td>
                        <td>{booking.seats?.length} seats</td>
                        <td>₹{booking.totalAmount}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="section">
              <h2>🔐 Access Control Policy</h2>
              <div className="policy-info">
                <h4>BookMyShow-Style Cinema Access Control</h4>
                <div className="role-cards">
                  <div className="role-card user">
                    <h5>👤 User</h5>
                    <ul>
                      <li>Browse movies</li>
                      <li>Book tickets</li>
                      <li>View own bookings</li>
                      <li>Cancel own bookings</li>
                    </ul>
                  </div>
                  <div className="role-card manager">
                    <h5>👔 Manager</h5>
                    <ul>
                      <li>All user permissions</li>
                      <li>View all bookings</li>
                      <li>Manage bookings</li>
                      <li>View reports</li>
                    </ul>
                  </div>
                  <div className="role-card admin">
                    <h5>🔐 Admin</h5>
                    <ul>
                      <li>All manager permissions</li>
                      <li>Add/Edit/Delete movies</li>
                      <li>Manage users</li>
                      <li>Change user roles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
