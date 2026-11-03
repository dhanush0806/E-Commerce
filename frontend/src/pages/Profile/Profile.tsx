import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Lock, MapPin, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Alert } from '../../components/Alert/Alert';
import './Profile.css';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await authService.updateProfile(formData);
      updateUser(updated);
      setFeedback({ type: 'success', msg: 'Account information updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', msg: 'Could not update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container account-page-wrapper">
      <h1 className="account-heading">Your Account</h1>

      <div className="account-hub-cards">
        <Link to="/orders" className="hub-card">
          <Package className="hub-icon" />
          <div>
            <h3>Your Orders</h3>
            <p>Track, return, or buy items again</p>
          </div>
        </Link>

        <div className="hub-card active">
          <UserCheck className="hub-icon" />
          <div>
            <h3>Profile & Login</h3>
            <p>Edit name, mobile number, and credentials</p>
          </div>
        </div>
      </div>

      <div className="account-form-pane">
        <h2>Personal Identification</h2>

        {feedback && <Alert type={feedback.type} message={feedback.msg} onClose={() => setFeedback(null)} />}

        <form onSubmit={handleSubmit} className="account-details-form">
          <div className="form-group-row">
            <label>First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          <div className="form-group-row">
            <label>Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className="form-group-row">
            <label>Email Address</label>
            <input type="email" disabled value={user?.email || ''} className="input-read" />
          </div>

          <div className="form-group-row">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-save-account" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
