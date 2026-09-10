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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 w-full"
    >
      <div className="card p-8 border-white/10 shadow-2xl bg-slate-900/80">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Sign In to Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your photography events and galleries
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Email Address</label>
            <div className="relative flex items-center">
              <HiOutlineMail className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-11"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="input-label mb-0">Password</label>
            </div>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-11 pr-11"
                placeholder="••••••••"
                autoComplete="current-password"
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

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold mt-2 shadow-lg cursor-pointer"
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Need an admin account?{' '}
          <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
            Register as Lead
          </Link>
        </p>
      </div>

      {/* Demo credentials quick login */}
      <div className="card p-4 border-indigo-500/20 bg-indigo-950/20 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
          <HiOutlineSparkles size={14} />
          <span>Quick Demo Access (Click to Fill):</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@snapshare.com');
              setPassword('admin123');
            }}
            className="p-3 rounded-xl text-left bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all cursor-pointer group"
          >
            <span className="text-xs font-bold text-white block group-hover:text-indigo-300">Admin / Lead</span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">admin@snapshare.com</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('rahul@snapshare.com');
              setPassword('member123');
            }}
            className="p-3 rounded-xl text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer group"
          >
            <span className="text-xs font-bold text-white block group-hover:text-emerald-300">Photographer</span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">rahul@snapshare.com</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
