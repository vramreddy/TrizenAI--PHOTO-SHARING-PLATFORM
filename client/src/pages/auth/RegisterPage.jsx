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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 w-full"
    >
      <div className="card p-8 border-white/10 shadow-2xl bg-slate-900/80">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Create Admin Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Lead photographer registration for event & gallery management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <div className="relative flex items-center">
              <HiOutlineUser className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-11"
                placeholder="Venkata Rami Reddy"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Email Address</label>
            <div className="relative flex items-center">
              <HiOutlineMail className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-11"
                placeholder="lead@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-11 pr-11"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Confirm Password</label>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-11"
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold mt-2 shadow-lg cursor-pointer"
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              'Create Lead Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
