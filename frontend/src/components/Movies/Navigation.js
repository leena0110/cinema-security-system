import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isStaff = isAdmin || isManager;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate('/movies')}>
          <span className="nav-logo">🎬</span>
          <span className="nav-title">CineSecure</span>
        </div>

        <div className="nav-menu">
          <button
            className={isActive('/movies')}
            onClick={() => navigate('/movies')}
          >
            🎥 Movies
          </button>
          <button
            className={isActive('/bookings')}
            onClick={() => navigate('/bookings')}
          >
            🎟️ My Bookings
          </button>
          
          {/* Staff-only: Dashboard with reports */}
          {isStaff && (
            <button
              className={isActive('/admin/dashboard')}
              onClick={() => navigate('/admin/dashboard')}
            >
              📊 Dashboard
            </button>
          )}
          
          {/* Admin-only: User management */}
          {isAdmin && (
            <button
              className={isActive('/admin/users')}
              onClick={() => navigate('/admin/users')}
            >
              👥 Users
            </button>
          )}
          
        </div>

        <div className="nav-user">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className={`user-role role-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;