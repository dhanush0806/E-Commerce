import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Alert } from '../../components/Alert/Alert';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await authService.login({ email, password });
      login(res.token, {
        id: res.id,
        email: res.email,
        firstName: res.firstName,
        lastName: res.lastName,
        role: res.role,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
        <h1>Sign in</h1>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="auth-clean-form">
          <div className="auth-field">
            <label>Email or mobile phone number</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <div className="password-label-row">
              <label>Password</label>
              <a href="#forgot" className="forgot-link">Forgot Password</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-auth-continue" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-legal-notice">
          By continuing, you agree to NexStore&apos;s Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className="auth-divider-line">
        <span>New to NexStore?</span>
      </div>

      <Link to="/register" className="btn-create-account-hollow">
        Create your NexStore account
      </Link>
    </div>
  );
};
