import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineSparkles } from 'react-icons/hi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/dashboard' : '/team');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Login Card */}
      <div
        className="card"
        style={{
          padding: '2.25rem',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-xl), 0 0 60px -12px hsla(239, 84%, 67%, 0.10)',
        }}
      >
        <div className="text-center" style={{ marginBottom: '1.75rem' }}>
          <h2
            className="font-extrabold tracking-tight"
            style={{ fontSize: '1.375rem', color: 'var(--text-primary)' }}
          >
            Sign In to Workspace
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
            Access your photography events and galleries
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email Field */}
          <div>
            <label className="input-label">Email Address</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <HiOutlineMail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="input-label">Password</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <HiOutlineLockClosed size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-right"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <p className="text-center" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Need an admin account?{' '}
          <Link
            to="/register"
            style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}
            className="hover:underline"
          >
            Register as Lead
          </Link>
        </p>
      </div>

      {/* Demo Credentials Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          borderColor: 'hsla(239, 84%, 67%, 0.15)',
          background: 'hsla(239, 50%, 12%, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-primary-light)',
            marginBottom: '0.75rem',
          }}
        >
          <HiOutlineSparkles size={14} />
          <span>Quick Demo Access (Click to Fill)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@snapshare.com');
              setPassword('admin123');
            }}
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'left',
              background: 'hsla(239, 84%, 67%, 0.08)',
              border: '1px solid hsla(239, 84%, 67%, 0.20)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="group"
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'hsla(239, 84%, 67%, 0.15)';
              e.currentTarget.style.borderColor = 'hsla(239, 84%, 67%, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'hsla(239, 84%, 67%, 0.08)';
              e.currentTarget.style.borderColor = 'hsla(239, 84%, 67%, 0.20)';
            }}
          >
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
              Admin / Lead
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              admin@snapshare.com
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('rahul@snapshare.com');
              setPassword('member123');
            }}
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'left',
              background: 'hsla(160, 84%, 39%, 0.08)',
              border: '1px solid hsla(160, 84%, 39%, 0.20)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'hsla(160, 84%, 39%, 0.15)';
              e.currentTarget.style.borderColor = 'hsla(160, 84%, 39%, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'hsla(160, 84%, 39%, 0.08)';
              e.currentTarget.style.borderColor = 'hsla(160, 84%, 39%, 0.20)';
            }}
          >
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
              Photographer
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              rahul@snapshare.com
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
