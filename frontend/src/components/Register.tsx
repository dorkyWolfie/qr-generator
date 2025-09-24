import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      padding: '48px 16px'
    }}>
      <div style={{
        maxWidth: '448px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div>
          <h2 style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '30px',
            fontWeight: '800',
            color: '#111827'
          }}>
            Create your account
          </h2>
        </div>
        <form style={{
          marginTop: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }} onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #F87171',
              color: '#B91C1C',
              padding: '12px 16px',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                style={{
                  marginTop: '4px',
                  appearance: 'none',
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                style={{
                  marginTop: '4px',
                  appearance: 'none',
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                style={{
                  marginTop: '4px',
                  appearance: 'none',
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                style={{
                  marginTop: '4px',
                  appearance: 'none',
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '8px 16px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: 'white',
                backgroundColor: loading ? '#9CA3AF' : '#4F46E5',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#4338CA';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#4F46E5';
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = '0 0 0 2px #6366F1, 0 0 0 4px rgba(99, 102, 241, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div style={{
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#4B5563'
            }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  fontWeight: '500',
                  color: '#4F46E5',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#6366F1'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#4F46E5'}
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;