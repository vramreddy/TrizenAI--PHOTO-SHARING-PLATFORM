import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'hsl(350, 89%, 60%)' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'hsl(38, 92%, 60%)' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'hsl(160, 84%, 54%)' };
    return { level: 4, label: 'Strong', color: 'hsl(160, 84%, 39%)' };
  };

  const strength = getPasswordStrength();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
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
            Create Admin Account
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
            Lead photographer registration for event & gallery management
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Full Name */}
          <div>
            <label className="input-label">Full Name</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <HiOutlineUser size={18} />
              </span>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Venkata Rami Reddy"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="input-label">Email Address</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <HiOutlineMail size={18} />
              </span>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="lead@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Password</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <HiOutlineLockClosed size={18} />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
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

            {/* Password Strength Bar */}
            {password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.25rem',
                    height: '3px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        borderRadius: '2px',
                        background: i <= strength.level ? strength.color : 'var(--border-subtle)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '0.6875rem', color: strength.color, marginTop: '0.25rem', fontWeight: 600 }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="input-label">Confirm Password</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <HiOutlineLockClosed size={18} />
              </span>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              'Create Lead Account'
            )}
          </button>
        </form>

        <p className="text-center" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}
            className="hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
