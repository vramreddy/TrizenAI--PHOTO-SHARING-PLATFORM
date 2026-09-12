import { useState, useEffect } from 'react';
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
  HiOutlineCamera,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineCloudUpload,
  HiOutlineShare,
  HiOutlineKey,
  HiOutlineCog,
  HiOutlineCheck,
} from 'react-icons/hi';

const mockNotifications = [
  { id: 1, title: 'Upload Completed', desc: 'Arjun uploaded 12 new high-res photos to Udaipur Wedding', time: '5m ago', read: false },
  { id: 2, title: 'Gallery Unlocked', desc: 'Client accessed TechConf 2026 gallery with PIN', time: '42m ago', read: false },
  { id: 3, title: 'PIN Generated', desc: 'Security PIN configured for Arjun & Priya Wedding', time: '2h ago', read: true },
];

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard', badge: 'Live' },
    { to: '/events', icon: HiOutlineCalendar, label: 'Events & Shoots' },
  ];

  const teamLinks = [
    { to: '/team', icon: HiOutlineViewGrid, label: 'Assigned Shoots' },
  ];

  const links = isAdmin ? adminLinks : teamLinks;

  const commandItems = [
    { label: 'Go to Dashboard Overview', action: () => navigate('/dashboard'), category: 'Navigation', icon: HiOutlineViewGrid },
    { label: 'View All Events & Projects', action: () => navigate('/events'), category: 'Navigation', icon: HiOutlineCalendar },
    { label: 'Create New Photography Event', action: () => navigate('/events/create'), category: 'Quick Action', icon: HiOutlinePlus },
    { label: 'Open Arjun & Priya Wedding Gallery', action: () => window.open('/gallery/arjun-priya-wedding', '_blank'), category: 'Client Galleries', icon: HiOutlineExternalLink },
    { label: 'Photographer Upload Workspace', action: () => navigate('/team'), category: 'Workspace', icon: HiOutlineCloudUpload },
  ];

  const filteredCommands = commandItems.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (location.pathname.startsWith('/events/create')) return 'Create Photography Event';
    if (location.pathname.startsWith('/events/')) return 'Event Workspace';
    if (location.pathname.startsWith('/events')) return 'All Events & Shoots';
    if (location.pathname.startsWith('/team/events/')) return 'Upload Photographs';
    if (location.pathname.startsWith('/team')) return 'Photographer Workspace';
    return 'TrizenAI Studio';
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-base)' }}>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'hsla(0, 0%, 0%, 0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Command Palette (Cmd+K) Modal ─────────────────── */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            style={{ background: 'hsla(222, 47%, 4%, 0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="glass-modal w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: '1px solid var(--border-strong)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.75rem' }}>
                <HiOutlineSearch size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0 }} />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search events..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    width: '100%',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <kbd
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'hsla(0, 0%, 100%, 0.08)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <div style={{ maxHeight: '20rem', overflowY: 'auto', padding: '0.5rem' }}>
                {filteredCommands.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No matching commands or events found for "{searchQuery}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        cmd.action();
                        setCommandPaletteOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'hsla(239, 84%, 67%, 0.15)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <cmd.icon size={18} style={{ color: 'var(--color-primary-light)' }} />
                        <span>{cmd.label}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          padding: '0.125rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'hsla(0,0,0,0.25)',
                        }}
                      >
                        {cmd.category}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col h-full transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '17.5rem',
          background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface-1) 100%)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-glow-sm)',
              }}
            >
              <HiOutlineCamera className="text-white" size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  TrizenAI
                </h1>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 800,
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'hsla(239, 84%, 67%, 0.15)',
                    color: 'var(--color-primary-light)',
                    border: '1px solid hsla(239, 84%, 67%, 0.25)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  ENTERPRISE
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.125rem' }}>
                Studio Operations Hub
              </p>
            </div>
          </div>
          <button
            className="lg:hidden"
            style={{
              color: 'var(--text-muted)',
              padding: '0.375rem',
              borderRadius: 'var(--radius-md)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div style={{ padding: '1.25rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          {/* Quick Search Button in Sidebar */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              background: 'hsla(0, 0%, 100%, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              marginBottom: '1.25rem',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.03)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HiOutlineSearch size={15} />
              <span>Search or jump to...</span>
            </div>
            <kbd
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '0.15rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                background: 'hsla(0, 0%, 100%, 0.06)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          <p
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            Core Operations
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard' || link.to === '/team'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `group ${isActive ? 'nav-active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: isActive ? 'hsla(239, 84%, 67%, 0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <link.icon size={19} style={{ flexShrink: 0, color: 'var(--color-primary-light)' }} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.375rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'hsla(160, 84%, 39%, 0.15)',
                      color: 'var(--color-success-light)',
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {isAdmin && (
            <div style={{ marginTop: '1.25rem' }}>
              <p
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0 0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                Quick Actions
              </p>
              <button
                onClick={() => {
                  navigate('/events/create');
                  setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  background: 'hsla(0, 0%, 100%, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'hsla(239, 84%, 67%, 0.08)';
                  e.currentTarget.style.borderColor = 'hsla(239, 84%, 67%, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.02)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'hsla(239, 84%, 67%, 0.15)',
                    color: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <HiOutlinePlus size={14} />
                </div>
                <span>Create New Shoot</span>
              </button>
            </div>
          )}

          {/* Cloud Storage Meter Widget */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.875rem',
              borderRadius: 'var(--radius-lg)',
              background: 'hsla(0, 0%, 100%, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Studio Storage</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>28%</span>
            </div>
            {/* Progress Bar */}
            <div style={{ height: '0.375rem', background: 'hsla(0, 0%, 100%, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '18%', background: '#6366F1' }} title="RAW Assets" />
              <div style={{ width: '8%', background: '#10B981' }} title="Optimized WebP" />
              <div style={{ width: '2%', background: '#F59E0B' }} title="Thumbnails" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              <span>14.2 GB used</span>
              <span>50.0 GB cap</span>
            </div>
          </div>
        </div>

        {/* User Profile at Bottom */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'hsla(222, 47%, 5%, 0.6)',
          }}
        >
          {/* User card */}
          <div
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              background: 'hsla(0, 0%, 100%, 0.02)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.625rem',
            }}
          >
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gradient-primary)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name}
              </p>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email}
              </p>
            </div>
            <span
              style={{
                fontSize: '0.5625rem',
                fontWeight: 700,
                padding: '0.125rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                flexShrink: 0,
                background: isAdmin ? 'hsla(239, 84%, 67%, 0.12)' : 'hsla(160, 84%, 39%, 0.12)',
                color: isAdmin ? 'var(--color-primary-light)' : 'var(--color-success-light)',
                border: isAdmin ? '1px solid hsla(239, 84%, 67%, 0.25)' : '1px solid hsla(160, 84%, 39%, 0.25)',
              }}
            >
              {isAdmin ? 'Admin' : 'Photographer'}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'none',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              padding: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--color-error-light)';
              e.currentTarget.style.background = 'hsla(350, 89%, 60%, 0.08)';
              e.currentTarget.style.borderColor = 'hsla(350, 89%, 60%, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <HiOutlineLogout size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top App Header */}
        <header
          className="glass-header sticky top-0 z-30"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <button
              className="lg:hidden"
              style={{
                color: 'var(--text-muted)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setSidebarOpen(true)}
            >
              <HiOutlineMenu size={22} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {getPageTitle()}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'var(--color-success-light)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'hsla(160, 84%, 39%, 0.1)',
                  }}
                >
                  <span className="pulse-dot" style={{ width: '0.35rem', height: '0.35rem', borderRadius: '50%', background: 'currentColor' }} />
                  Live Sync
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                TrizenAI Enterprise Event Ingestion Suite
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            {/* Quick Command Bar Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:inline-flex"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                background: 'hsla(0, 0%, 100%, 0.04)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <HiOutlineSearch size={14} />
              <span>Quick Search</span>
              <kbd style={{ fontSize: '0.625rem', background: 'hsla(0,0,0,0.3)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>⌘K</kbd>
            </button>

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                style={{
                  position: 'relative',
                  width: '2.125rem',
                  height: '2.125rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'hsla(0, 0%, 100%, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <HiOutlineBell size={17} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '0.625rem',
                      height: '0.625rem',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      border: '2px solid var(--surface-base)',
                    }}
                  />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="glass-modal absolute right-0 mt-2 w-80 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ border: '1px solid var(--border-strong)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          style={{ fontSize: '0.6875rem', color: 'var(--color-primary-light)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '16rem', overflowY: 'auto' }}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: n.read ? 'transparent' : 'hsla(239, 84%, 67%, 0.06)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</span>
                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{n.time}</span>
                          </div>
                          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Public Demo Link */}
            <a
              href="/gallery/arjun-priya-wedding"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-primary-light)',
                background: 'hsla(239, 84%, 67%, 0.08)',
                border: '1px solid hsla(239, 84%, 67%, 0.25)',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}
            >
              <HiOutlineExternalLink size={14} />
              Client Gallery Demo
            </a>

            <div className="hidden sm:block" style={{ width: '1px', height: '1.5rem', background: 'var(--border-subtle)' }} />

            {/* User Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden md:block" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '0.125rem' }}>
                  {isAdmin ? 'Lead Admin' : 'Staff Photographer'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: '1.5rem', maxWidth: '88rem', width: '100%', margin: '0 auto' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
