import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineClipboardCopy,
  HiOutlineExternalLink,
  HiOutlineFilter,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

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

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (statusFilter === 'live') return matchesSearch && event.galleryPublished;
      if (statusFilter === 'draft') return matchesSearch && !event.galleryPublished;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'photos') return (b.totalPhotos || 0) - (a.totalPhotos || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const liveCount = events.filter((e) => e.galleryPublished).length;
  const draftCount = events.filter((e) => !e.galleryPublished).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '22rem', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading photography projects...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div
        className="glass"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.75rem',
          borderRadius: 'var(--radius-2xl)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Events & Photography Projects
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage team assignments, curate uploaded media, and publish protected client delivery links.
          </p>
        </div>
        <Link to="/events/create" className="btn-primary" style={{ flexShrink: 0 }}>
          <HiOutlinePlus size={17} /> Create New Event
        </Link>
      </div>

      {/* Interactive Controls Bar: Search, Status Tabs, Sort, View Toggle */}
      <div
        className="card"
        style={{
          padding: '0.875rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: statusFilter === 'all' ? 'hsla(239, 84%, 67%, 0.15)' : 'transparent',
              color: statusFilter === 'all' ? 'var(--color-primary-light)' : 'var(--text-tertiary)',
              border: statusFilter === 'all' ? '1px solid hsla(239, 84%, 67%, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All Projects ({events.length})
          </button>
          <button
            onClick={() => setStatusFilter('live')}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: statusFilter === 'live' ? 'hsla(160, 84%, 39%, 0.15)' : 'transparent',
              color: statusFilter === 'live' ? 'var(--color-success-light)' : 'var(--text-tertiary)',
              border: statusFilter === 'live' ? '1px solid hsla(160, 84%, 39%, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Live Client Portals ({liveCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: statusFilter === 'draft' ? 'hsla(38, 92%, 60%, 0.15)' : 'transparent',
              color: statusFilter === 'draft' ? 'var(--color-gold)' : 'var(--text-tertiary)',
              border: statusFilter === 'draft' ? '1px solid hsla(38, 92%, 60%, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Draft & Ingesting ({draftCount})
          </button>
        </div>

        {/* Search, Sort, View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div className="input-icon-wrapper" style={{ width: '13rem' }}>
            <HiOutlineSearch className="input-icon" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="input"
              style={{ padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.8125rem' }}
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8125rem',
              width: 'auto',
              cursor: 'pointer',
              background: 'var(--surface-1)',
            }}
          >
            <option value="newest">Latest Created</option>
            <option value="photos">Most Photos</option>
            <option value="name">Name (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-1)',
              padding: '0.1875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'grid' ? 'hsla(239, 84%, 67%, 0.2)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-primary-light)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HiOutlineViewGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'table' ? 'hsla(239, 84%, 67%, 0.2)' : 'transparent',
                color: viewMode === 'table' ? 'var(--color-primary-light)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HiOutlineViewList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Listing */}
      {filteredEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'hsla(239, 84%, 67%, 0.10)',
              color: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <HiOutlineCalendar size={28} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            No Matching Events Found
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '22rem', marginBottom: '1.5rem' }}>
            {searchQuery ? `No projects matching "${searchQuery}"` : 'Create your first photography project to get started.'}
          </p>
          <Link to="/events/create" className="btn-primary">
            <HiOutlinePlus size={17} /> Create Event
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* ─── Grid View ─────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event, index) => {
            const slug = event.gallery?.slug || event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="card group"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    padding: '1.5rem',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                          }}
                        >
                          <HiOutlineCalendar size={18} />
                        </div>
                        <div>
                          <h3
                            className="group-hover:text-indigo-300"
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              transition: 'color 0.2s ease',
                              lineHeight: 1.3,
                            }}
                          >
                            {event.name}
                          </h3>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {event.galleryPublished ? (
                        <span className="badge badge-success">
                          <HiOutlineCheckCircle size={13} /> Live
                        </span>
                      ) : (
                        <span className="badge badge-warning">Draft</span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-tertiary)',
                        lineHeight: 1.5,
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {event.description || 'Enterprise photo shoot workspace.'}
                    </p>
                  </div>

                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <HiOutlinePhotograph size={15} style={{ color: 'var(--color-primary-light)' }} />
                        <strong style={{ color: 'var(--text-secondary)' }}>{event.totalPhotos || 0}</strong> photos
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <HiOutlineUserGroup size={15} style={{ color: 'var(--color-gold)' }} />
                        <strong style={{ color: 'var(--text-secondary)' }}>{event.teamMembers?.length || 0}</strong> team
                      </span>
                      {event.gallery?.pin && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                          <HiOutlineShieldCheck size={14} /> PIN Set
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        onClick={() => copyToClipboard(`http://localhost:5173/gallery/${slug}`, 'Client Gallery URL copied')}
                        className="btn-secondary"
                        style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center' }}
                      >
                        <HiOutlineClipboardCopy size={14} /> Link
                      </button>
                      <Link
                        to={`/events/${event._id}`}
                        className="btn-primary"
                        style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center' }}
                      >
                        Manage
                        <HiOutlineArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ─── Table / List View ─────────────────────────── */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'hsla(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Project Name</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Photos</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Photographers</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Created</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const slug = event.gallery?.slug || event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <tr
                      key={event._id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'hsla(0,0,0,0.15)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '2rem',
                              height: '2rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--gradient-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              flexShrink: 0,
                            }}
                          >
                            <HiOutlineCalendar size={14} />
                          </div>
                          <div>
                            <Link
                              to={`/events/${event._id}`}
                              style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                            >
                              {event.name}
                            </Link>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', maxWidth: '18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {event.description || 'Enterprise shoot'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        {event.galleryPublished ? (
                          <span className="badge badge-success">
                            <HiOutlineCheckCircle size={12} /> Live
                          </span>
                        ) : (
                          <span className="badge badge-warning">Draft</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {event.totalPhotos || 0}
                      </td>
                      <td style={{ padding: '1rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {event.teamMembers?.length || 0}
                      </td>
                      <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)' }}>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => copyToClipboard(`http://localhost:5173/gallery/${slug}`, 'Client Gallery Link copied')}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            title="Copy Client Link"
                          >
                            <HiOutlineClipboardCopy size={14} />
                          </button>
                          <Link
                            to={`/events/${event._id}`}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            Open Console
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EventsPage;
