import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import Navigation from '../Movies/Navigation';
import api from '../../services/api';
import './Admin.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      navigate('/movies');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        setSuccess(`Role updated successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        setSuccess('User deleted successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'manager': return 'role-badge manager';
      default: return 'role-badge user';
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading users...</p>
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
            <h1>👥 User Management</h1>
            <p>Manage user accounts and roles</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <span>⚠️</span> {error}
              <button className="alert-close" onClick={() => setError('')}>×</button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓</span> {success}
              <button className="alert-close" onClick={() => setSuccess('')}>×</button>
            </div>
          )}

          <div className="section">
            <div className="section-header">
              <h2>All Users ({users.length})</h2>
            </div>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar">👤</span>
                        <span>{u.username}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(u.role)}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.isVerified ? 'confirmed' : 'pending'}`}>
                        {u.isVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td>
                      {u.lastLogin 
                        ? new Date(u.lastLogin).toLocaleString() 
                        : 'Never'}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u.username === 'admin'}
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        {u.username !== 'admin' && u.username !== 'manager' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id, u.username)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section info-section">
            <h2>ℹ️ Role Permissions</h2>
            <div className="permissions-grid">
              <div className="permission-card">
                <h4>👤 User</h4>
                <p>Regular customers who can browse movies and book tickets.</p>
              </div>
              <div className="permission-card">
                <h4>👔 Manager</h4>
                <p>Cinema staff who can view all bookings and generate reports.</p>
              </div>
              <div className="permission-card">
                <h4>🔐 Admin</h4>
                <p>System administrators with full access to all features.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
