
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CarFront,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const token =
        response.data.access_token ||
        response.data.accessToken;

      if (!token) {
        throw new Error('No access token received.');
      }

      localStorage.setItem('token', token);

      const profile = await api.get('/auth/profile');

      localStorage.setItem(
        'user',
        JSON.stringify(profile.data)
      );

      navigate('/dashboard', { replace: true });
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <CarFront size={52} />
          <h1>AutoTrack</h1>
          <p>
            Automotive Service and Maintenance
            Management System
          </p>
        </div>

        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">
            Sign in to manage your automotive shop.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  id="password"
                  type={
                    showPassword ? 'text' : 'password'
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-note">
            Authorized shop staff only
          </p>
        </div>

        <p className="login-footer">
          © 2026 AutoTrack. All rights reserved.
        </p>

      </div>
    </div>
  );
}

export default Login;
