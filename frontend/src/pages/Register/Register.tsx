import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Alert } from '../../components/Alert/Alert';
import './Register.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await authService.register(formData);
      login(res.token, {
        id: res.id,
        email: res.email,
        firstName: res.firstName,
        lastName: res.lastName,
        role: res.role,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commercial-auth-page">
      <Link to="/" className="auth-brand-logo">
        Nex<span>Store</span>
      </Link>

      <div className="auth-box">
        <h1>Create Account</h1>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="auth-clean-form">
          <div className="auth-field">
            <label>First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label>Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label>Mobile Number</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label>Password (At least 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-auth-continue" disabled={loading}>
            {loading ? 'Creating...' : 'Verify and Register'}
          </button>
        </form>

        <p className="auth-legal-notice">
          Already have an account? <Link to="/login" style={{ color: '#007185' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};
