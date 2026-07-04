import React, { useState } from 'react';
import { Lock, User, Mail, ShieldAlert, KeyRound, Building } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_BASE = 'http://localhost:4000';

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setPharmacyName('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // Login flow
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login failed.');
        }

        // Save session locally and notify App.jsx
        onLoginSuccess(data);
      } else {
        // Registration flow
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, pharmacyName })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Registration failed.');
        }

        setSuccessMsg('Account registered successfully! Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-app)'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div className="logo-icon" style={{ width: '56px', height: '56px', fontSize: '1.75rem', borderRadius: '12px' }}>💊</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'var(--accent-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            RxKeep Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isLogin ? 'Log in to manage inventory & sales' : 'Create a new medical administrator account'}
          </p>
        </div>

        {/* Message banners */}
        {errorMsg && (
          <div className="alert-box danger" style={{ fontSize: '0.85rem', padding: '0.75rem 1rem' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-box" style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'var(--success-bg)', border: '1px solid rgba(22,163,74,0.2)', color: 'var(--color-success)' }}>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Pharmacy Name (Register Only) */}
          {!isLogin && (
            <div className="form-group">
              <label>Pharmacy / Store Name *</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Care Pharmacy"
                  className="custom-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email (Register Only) */}
          {!isLogin && (
            <div className="form-group">
              <label>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. info@pharmacy.com"
                  className="custom-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div className="form-group">
            <label>Username *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                placeholder="Username"
                className="custom-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="Password"
                className="custom-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Action button */}
          <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem', width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            <KeyRound size={16} /> {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={handleToggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </div>

      </div>
    </div>
  );
}
