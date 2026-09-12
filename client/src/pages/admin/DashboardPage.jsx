import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineClipboardCopy,
  HiOutlineExternalLink,
  HiOutlineCloudUpload,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineTrendingUp,
  HiOutlineSearch,
} from 'react-icons/hi';

const mockActivities = [
  { id: 1, action: 'Uploaded 12 high-res portraits', event: 'Arjun & Priya Wedding', user: 'Arjun (Photographer)', time: '4 mins ago', type: 'upload' },
  { id: 2, action: 'Client unlocked gallery via PIN', event: 'TechConf 2026 Annual Summit', user: 'Client Guest', time: '38 mins ago', type: 'view' },
  { id: 3, action: 'Generated secure PIN & Watermark', event: 'Arjun & Priya Wedding', user: 'Admin User', time: '2 hours ago', type: 'security' },
  { id: 4, action: 'Assigned 2 team photographers', event: 'TechConf 2026 Annual Summit', user: 'Admin User', time: '5 hours ago', type: 'team' },
];

const StatsCard = ({ icon: Icon, label, value, subtext, trend, color, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="stat-card group"
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: gradient,
          boxShadow: `0 4px 12px -2px ${color}35`,
          transition: 'transform 0.25s ease',
        }}
        className="group-hover:scale-105"
      >
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-success-light)',
            background: 'hsla(160, 84%, 39%, 0.12)',
            border: '1px solid hsla(160, 84%, 39%, 0.2)',
          }}
        >
          <HiOutlineTrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </h3>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{label}</p>
      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{subtext}</p>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await eventService.getAll();
      setEvents(data.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    toast.success(message || 'Copied to clipboard');
  };

  const totalPhotos = events.reduce((sum, e) => sum + (e.totalPhotos || 0), 0);
  const totalMembers = events.reduce((sum, e) => sum + (e.teamMembers?.length || 0), 0);
  const publishedGalleries = events.filter((e) => e.galleryPublished).length;

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '22rem', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Connecting to studio database...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ─── Hero Command Console ─────────────────────────── */}
      <div
        className="glass"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '2rem',
          borderRadius: 'var(--radius-2xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsla(239, 84%, 67%, 0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <HiOutlineSparkles size={14} /> Production Ingestion Engine
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Event Photography Studio Console
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.375rem', maxWidth: '42rem' }}>
              Centralize high-volume photo ingestion from multiple photographers, manage curation approvals, and deploy PIN-protected client galleries.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/events/create" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <HiOutlinePlus size={18} />
              Create New Shoot
            </Link>
            <a
              href="/gallery/arjun-priya-wedding"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <HiOutlineExternalLink size={16} />
              Preview Demo Gallery
            </a>
          </div>
        </div>
      </div>

      {/* ─── Metric KPI Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={HiOutlineCalendar}
          label="Active Projects"
          value={events.length}
          subtext="Current active photo shoots"
          trend="+100% active"
          color="#6366F1"
          gradient="linear-gradient(135deg, hsl(239, 84%, 64%) 0%, hsl(239, 64%, 52%) 100%)"
          delay={0}
        />
        <StatsCard
          icon={HiOutlinePhotograph}
          label="Curated Photos"
          value={totalPhotos.toLocaleString()}
          subtext="Compressed & WebP optimized"
          trend="8.4 GB indexed"
          color="#10B981"
          gradient="linear-gradient(135deg, hsl(160, 84%, 39%) 0%, hsl(160, 70%, 30%) 100%)"
          delay={0.08}
        />
        <StatsCard
          icon={HiOutlineUserGroup}
          label="Assigned Photographers"
          value={totalMembers}
          subtext="Active field collaborators"
          trend="Team ready"
          color="#F59E0B"
          gradient="linear-gradient(135deg, hsl(38, 92%, 60%) 0%, hsl(38, 80%, 42%) 100%)"
          delay={0.16}
        />
        <StatsCard
          icon={HiOutlineEye}
          label="Client Galleries"
          value={publishedGalleries}
          subtext="PIN-secured customer portals"
          trend="Live delivery"
          color="#EC4899"
          gradient="linear-gradient(135deg, hsl(330, 81%, 60%) 0%, hsl(330, 70%, 42%) 100%)"
          delay={0.24}
        />
      </div>

      {/* ─── Main Content Split Layout ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Shoots / Events */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Photography Shoots & Projects
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Track ingestion status, client access, and curated deliveries
              </p>
            </div>

            {/* Quick Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="input-icon-wrapper" style={{ width: '14rem' }}>
                <HiOutlineSearch className="input-icon" size={15} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter shoots..."
                  className="input"
                  style={{ padding: '0.45rem 0.75rem 0.45rem 2.25rem', fontSize: '0.8125rem' }}
                />
              </div>
              <Link to="/events" className="btn-secondary" style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
                View All ({events.length})
              </Link>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <HiOutlineCalendar size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>No projects matched query</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Try refining your search keyword</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredEvents.map((event, index) => {
                const slug = event.gallery?.slug || event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="card group" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                          <div
                            style={{
                              width: '3rem',
                              height: '3rem',
                              borderRadius: 'var(--radius-lg)',
                              background: 'var(--surface-1)',
                              border: '1px solid var(--border-default)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <HiOutlinePhotograph size={22} style={{ color: 'var(--color-primary-light)' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <h3
                                className="group-hover:text-indigo-300"
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  transition: 'color 0.2s ease',
                                }}
                              >
                                {event.name}
                              </h3>
                              <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                <span className="pulse-dot" style={{ width: '0.35rem', height: '0.35rem', borderRadius: '50%', background: 'currentColor' }} />
                                {event.status}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                              {event.description || 'Enterprise photo shoot workspace.'}
                            </p>
                          </div>
                        </div>

                        {/* PIN & Gallery Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {event.galleryPublished ? (
                            <span className="badge badge-success">
                              <HiOutlineCheckCircle size={13} /> Live Gallery
                            </span>
                          ) : (
                            <span className="badge badge-warning">Draft Gallery</span>
                          )}
                        </div>
                      </div>

                      {/* Footer Metadata & Actions */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          paddingTop: '0.875rem',
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <HiOutlinePhotograph size={15} style={{ color: 'var(--color-primary-light)' }} />
                            <strong style={{ color: 'var(--text-secondary)' }}>{event.totalPhotos || 0}</strong> photos
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <HiOutlineUserGroup size={15} style={{ color: 'var(--color-gold)' }} />
                            <strong style={{ color: 'var(--text-secondary)' }}>{event.teamMembers?.length || 0}</strong> photographers
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => copyToClipboard(`http://localhost:5173/gallery/${slug}`, 'Client Gallery URL copied!')}
                            title="Copy Client Gallery Link"
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'hsla(0, 0%, 100%, 0.04)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <HiOutlineClipboardCopy size={14} /> Link
                          </button>
                          <Link
                            to={`/events/${event._id}`}
                            className="btn-primary"
                            style={{ padding: '0.45rem 0.875rem', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Manage Studio
                            <HiOutlineArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Operations Activity Log & Quick Client Share */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recent Operations Activity */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineClock size={17} style={{ color: 'var(--color-primary-light)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Audit Trail</h3>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-success-light)', background: 'hsla(160, 84%, 39%, 0.1)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                Real-Time
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {mockActivities.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.75rem' }}>
                  <div
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'hsla(0, 0%, 100%, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.125rem',
                    }}
                  >
                    {act.type === 'upload' && <HiOutlineCloudUpload size={13} style={{ color: '#10B981' }} />}
                    {act.type === 'view' && <HiOutlineEye size={13} style={{ color: '#6366F1' }} />}
                    {act.type === 'security' && <HiOutlineShieldCheck size={13} style={{ color: '#F59E0B' }} />}
                    {act.type === 'team' && <HiOutlineUserGroup size={13} style={{ color: '#EC4899' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{act.action}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '0.125rem' }}>
                      {act.event} · <span style={{ color: 'var(--text-tertiary)' }}>{act.time}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Client PIN Delivery Card */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              background: 'linear-gradient(145deg, hsla(239, 84%, 67%, 0.08) 0%, hsla(222, 33%, 12%, 0.95) 100%)',
              border: '1px solid hsla(239, 84%, 67%, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <HiOutlineShieldCheck size={18} style={{ color: 'var(--color-primary-light)' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Client PIN Delivery</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.4, marginBottom: '1rem' }}>
              Deliver password-free yet private gallery access to VIP clients using instant 6-digit access codes.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-lg)',
                background: 'hsla(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Demo Client PIN</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-light)', letterSpacing: '0.15em' }}>123456</p>
              </div>
              <button
                onClick={() => copyToClipboard('123456', 'Client PIN copied: 123456')}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.6875rem', fontWeight: 700 }}
              >
                Copy PIN
              </button>
            </div>

            <a
              href="/gallery/arjun-priya-wedding"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '0.625rem' }}
            >
              <HiOutlineExternalLink size={15} /> Test Client Unlock Experience
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
