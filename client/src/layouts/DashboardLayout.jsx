import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineExternalLink,
  HiOutlinePlus,
  HiOutlineSparkles,
} from 'react-icons/hi';

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/events', icon: HiOutlineCalendar, label: 'Events' },
  ];

  const teamLinks = [
    { to: '/team', icon: HiOutlineViewGrid, label: 'My Assigned Events' },
  ];

  const links = isAdmin ? adminLinks : teamLinks;

  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (location.pathname.startsWith('/events/create')) return 'Create New Event';
    if (location.pathname.startsWith('/events/')) return 'Event Management';
    if (location.pathname.startsWith('/events')) return 'All Events';
    if (location.pathname.startsWith('/team/events/')) return 'Upload Photographs';
    if (location.pathname.startsWith('/team')) return 'Photographer Workspace';
    return 'SnapShare Portal';
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0B0F19' }}>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center relative shadow-lg"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 25px -3px rgba(99, 102, 241, 0.4)',
              }}
            >
              <HiOutlinePhotograph className="text-white text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-white tracking-tight">SnapShare</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">PRO</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Collaborative Platform</p>
            </div>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX size={22} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Navigation</p>
            <nav className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background: 'var(--gradient-primary)',
                          boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.4)',
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={20} className="transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-[.active]:opacity-100" />
                </NavLink>
              ))}
            </nav>
          </div>

          {isAdmin && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/events/create');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 transition-all text-left group"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <HiOutlinePlus size={14} />
                  </div>
                  <span>Create New Event</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card Pinned at Bottom */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: isAdmin ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                color: isAdmin ? '#A5B4FC' : '#6EE7B7',
                border: isAdmin ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(16,185,129,0.3)',
              }}
            >
              {isAdmin ? 'Admin' : 'Photographer'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all w-full py-2.5 rounded-xl"
          >
            <HiOutlineLogout size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top App Header */}
        <header
          className="glass-header sticky top-0 z-30 flex items-center justify-between px-6 py-4"
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
            >
              <HiOutlineMenu size={22} />
            </button>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{getPageTitle()}</h2>
              <p className="text-xs text-slate-400">TrizenAI Event Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/gallery/arjun-priya-wedding"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
            >
              <HiOutlineExternalLink size={14} />
              Demo Gallery Preview
            </a>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">{isAdmin ? 'Lead Admin' : 'Team Photographer'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
