import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import Landing from './components/Auth/Landing';
import MoviesList from './components/Movies/MoviesList';
import BookingConfirmation from './components/Booking/BookingConfirmation';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminUsers from './components/Admin/AdminUsers';
import { BeamsBackground } from './components/ui/beams-background';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Beams Background Effect */}
          <BeamsBackground intensity="strong" />
          <Routes>
            <Route path="/login" element={<Landing />} />
            <Route path="/movies" element={<MoviesList />} />
            <Route path="/bookings" element={<BookingConfirmation />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;